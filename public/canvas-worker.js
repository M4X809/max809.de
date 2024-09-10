// // public/canvas-worker.js

// self.onmessage = function (evt) {
// 	const canvas = evt.data.canvas;
// 	const width = evt.data.width;
// 	const height = evt.data.height;
// 	const qrDataUrl = evt.data.qrDataUrl; // Base64 data URL for the QR code image
// 	const ctx = canvas.getContext("2d");

// 	// Ensure canvas dimensions are set only once if resizing
// 	if (canvas.width !== width || canvas.height !== height) {
// 		canvas.width = width;
// 		canvas.height = height;
// 	}

// 	// Render on the offscreen canvas
// 	function draw() {
// 		ctx.clearRect(0, 0, canvas.width, canvas.height);

// 		// If we received QR data, draw it
// 		if (qrDataUrl) {
// 			const img = new Image();
// 			img.src = qrDataUrl;
// 			img.onload = () => {
// 				ctx.drawImage(img, 0, 0);
// 				requestAnimationFrame(draw);
// 			};
// 		} else {
// 			requestAnimationFrame(draw);
// 		}
// 	}

// 	requestAnimationFrame(draw);
// };
