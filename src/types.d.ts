// interface QRCodeOptions {
// 	content: string;
// 	image?: string;
// 	fgColor?: string;
// 	bgColor?: string;
// 	blockSize?: number;
// 	imageSize?: number;
// 	copyToClipboard?: boolean;
// 	downloadable?: boolean;
// }

// declare module "react-qrcode-js" {
// 	export default function QRCode(props: QRCodeOptions): JSX.Element;
// }

//   image,
//   fgColor = "#000000",
//   bgColor = "#ffffff",
//   blockSize = 10,
//   imageSize = 75,
//   copyToClipboard = true,
//   downloadable = false,

// image,
// fgColor = "#000000",
// bgColor = "#ffffff",
// blockSize = 10,
// imageSize = 75,
// copyToClipboard = true,
// downloadable = false,

export interface Permissions {
	name: string;
	icon: IconProp;
	perms: Perm[];
}

export interface Perm {
	name: string;
	icon: IconProp;
	perm?: string;
	disabled?: boolean;
	children?: Perm[];
	danger?: boolean;
	blocked?: boolean;
}
