'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function getValueIgnoringKeyCase(object, key) {
	var foundKey = Object.keys(object).find(function (currentKey) {
		return currentKey.toLocaleLowerCase() === key.toLowerCase();
	});
	return object[foundKey];
}
function getBoundary(event) {
	return getValueIgnoringKeyCase(event.headers, 'Content-Type').split('=')[1];
}
function getBody(event) {
	if (event.isBase64Encoded) {
		return Buffer.from(event.body, 'base64').toString('binary');
	}
	return event.body;
}
exports.parse = function (event, spotText) {
	var boundary = getBoundary(event);
	var result = {
		files: [],
		images: [],
		thumbnail: {},
	};
	getBody(event)
		.split(boundary)
		.forEach(function (item) {
			if (/filename=".+"/g.test(item)) {
				if (item.match(/thumbnail".+"/g)) {
					switch (item.match(/Content-Type:\s.+/g)[0].slice(14)) {
						case 'image/jpeg':
						case 'image/png':
						case 'image/bmp':
						case 'image/webp':
							result.thumbnail = {
								filename: item.match(/filename=".+"/g)[0].slice(10, -1),
								contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
								content: spotText
									? Buffer.from(
											item.slice(
												item.search(/Content-Type:\s.+/g) +
													item.match(/Content-Type:\s.+/g)[0].length +
													4,
												-4
											),
											'binary'
									  )
									: item.slice(
											item.search(/Content-Type:\s.+/g) +
												item.match(/Content-Type:\s.+/g)[0].length +
												4,
											-4
									  ),
							};
							break;
						default:
							break;
					}
				} else {
					switch (item.match(/Content-Type:\s.+/g)[0].slice(14)) {
						case 'image/jpeg':
						case 'image/png':
						case 'image/bmp':
						case 'image/webp':
							result.images.push({
								filename: item.match(/filename=".+"/g)[0].slice(10, -1),
								contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
								content: spotText
									? Buffer.from(
											item.slice(
												item.search(/Content-Type:\s.+/g) +
													item.match(/Content-Type:\s.+/g)[0].length +
													4,
												-4
											),
											'binary'
									  )
									: item.slice(
											item.search(/Content-Type:\s.+/g) +
												item.match(/Content-Type:\s.+/g)[0].length +
												4,
											-4
									  ),
							});
							break;
						case 'application/pdf':
						case 'application/vnd.mspowerpoint':
						case 'application/vnd.ms-powerpoint':
						case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
						case 'application/vnd.ms-excel':
						case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
						case 'application/msword':
						case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
							result.files.push({
								type: 'file',
								filename: item.match(/filename=".+"/g)[0].slice(10, -1),
								contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
								content: spotText
									? Buffer.from(
											item.slice(
												item.search(/Content-Type:\s.+/g) +
													item.match(/Content-Type:\s.+/g)[0].length +
													4,
												-4
											),
											'binary'
									  )
									: item.slice(
											item.search(/Content-Type:\s.+/g) +
												item.match(/Content-Type:\s.+/g)[0].length +
												4,
											-4
									  ),
							});
						default:
							break;
					}
				}
			} else if (/name=".+"/g.test(item)) {
				if (
					item.slice(
						item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4,
						-4
					) === 'true' ||
					item.slice(
						item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4,
						-4
					) === 'false'
				) {
					result[item.match(/name=".+"/g)[0].slice(6, -1)] =
						item.slice(
							item.search(/name=".+"/g) +
								item.match(/name=".+"/g)[0].length +
								4,
							-4
						) === true;
				} else {
					result[item.match(/name=".+"/g)[0].slice(6, -1)] = item.slice(
						item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4,
						-4
					);
				}
			}
		});
	return result;
};
