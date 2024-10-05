export interface CubeHistory {
	history: History[];
	page: number;
	totalPages: number;
	total: number;
}

export interface History {
	id: string;
	createdById?: string;
	cubeSize: string;
	scramble: string;
	time: number;
	createdAt: Date;
}
