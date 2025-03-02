import { $, type ShellError } from "bun";
import { createLogger } from "./logger";
import chalk from "chalk";

const projects = [
	{
		name: "max809.de",
		command: "typecheck:next",
		path: ".",
	},
];

type Result = {
	name: string;
	errorCount: number;
	success: boolean;
};

const logger = createLogger("Typecheck");
async function check(project: (typeof projects)[number]): Promise<Result> {
	$.cwd(project.path);
	$.throws(true);
	try {
		logger.await(
			chalk.blue(`Running typecheck for project: ${chalk.bold(project.name)}`),
		);
		await $`bun run ${project.command}`.quiet();
		logger.success(
			chalk.green(`typecheck completed for project: ${chalk.bold(project.name)}`),
		);
		logger.divider();
		return {
			name: project.name,
			errorCount: 0,
			success: true,
		};
	} catch (_err: any) {
		const err = _err as ShellError;

		logger.error(
			chalk.red(`typecheck failed for project: ${chalk.bold(project.name)}\n`),
		);
		const logLines = err?.stdout?.toString()?.split("\n");
		const errorLines = logLines.filter((line: string) =>
			line.includes("error TS"),
		);
		const maxPathLength =
			Math.max(
				...errorLines.map((line: string) => line.split(":").at(0)?.length ?? 0),
			) + 5;

		const output = errorLines.map((line: string) => {
			const parts = line.split(":");
			const path = parts.at(0);
			// const path = parts.at(0)?.replace(/\(.*\)$/, "");
			// const lineCol =
			// 	parts
			// 		.at(0)
			// 		?.match(/\((.*?)\)$/)?.[1]
			// 		?.split(",") ?? [];
			// const lineNumbers = lineCol.map((num: string) => chalk.hex("#C0CCCC")(num));
			const error = parts[2]?.replace(/'([^']+)'/g, `${chalk.red("'$1'")}`);
			const finishedLine = `${chalk.gray(`${project.path}/${path?.padEnd(maxPathLength, " ")}`)}${chalk.hex("#C0CCCC")(error)}\n`;
			// const finishedLine = `${chalk.gray(`${project.path}/${path?.padEnd(maxPathLength, " ")}`)}${lineNumbers.join(":").padEnd(maxPathLength, " ")}${chalk.hex("#C0CCCC")(error)}\n`;
			return finishedLine;
		});

		for (const item of output) {
			logger.error(item);
		}

		logger.divider();

		return {
			name: project.name,
			errorCount: output.length,
			success: false,
		};
	}
}

async function run() {
	const results: Result[] = [];
	const maxNameLength = Math.max(
		...projects.map((project) => project.name.length + 5),
	);

	for (const project of projects) {
		const result = await check(project);
		if (result) {
			results.push(result);
		}
	}
	const maxErrorLength = Math.max(
		...results.map((result) => result.errorCount.toString().length + 2),
	);

	for (const result of results) {
		const nameString = `"${result.name}"`;
		if (!result.success) {
			logger.error(
				chalk.red(nameString.padEnd(maxNameLength, " ")),
				chalk.yellow(result.errorCount.toString().padEnd(maxErrorLength, " ")),
				chalk.red("FAILED"),

				// `${chalk.red(result.errorCount.toString().padStart(maxErrorLength, " "))} ERRORS`,
			);
		} else {
			logger.success(
				chalk.green(nameString.padEnd(maxNameLength, " ")),
				"".padEnd(maxErrorLength, " "),
				chalk.green("PASSED"),
			);
		}
	}

	if (!results.every((result) => result.success)) {
		logger.divider();
		logger.fatal(chalk.hex("#FFA500")("TS check failed!!!"));
		process.exit(1);
	}
	process.exit(0);

	// const failedProjects = results.filter((result) => !result.success);
	// const successProjects = results.filter((result) => result.success);

	// if (failedProjects.length > 0) {
	// 	logger.info(chalk.red("Failed Projects:"));
	// 	for (const project of failedProjects) {
	// 		logger.error(chalk.red(`"${project.name}"`), `(${chalk.red(project.errorCount)} errors)`);
	// 	}
	// }

	// if (successProjects.length > 0) {
	// 	logger.info(chalk.green("Passed Projects:"));
	// 	for (const project of successProjects) {
	// 		logger.success(`"${project.name}"`);
	// 	}
	// }
}

run();
