function listenAndAccept(socketId) {
	  netInterfaces().then(function(interfaces) {
			$.each(interfaces, function(i, interface) {
					// Only run for IPv4
					if (interface.address.indexOf(".") >= 0) {
						chrome.sockets.tcpServer.listen(socketId,
							interface.address, 1234, function(resultCode) {
								onListenCallback(socketId, resultCode);
						});
						return false;
					}
			});
		});
}

var serverSocketId;
function onListenCallback(socketId, resultCode) {
  if (resultCode < 0) return;
  serverSocketId = socketId;
  chrome.sockets.tcpServer.onAccept.addListener(onAccept);
}

function onAccept(info) {
  if (info.socketId != serverSocketId) return;
  // A new TCP connection has been established.
  /*
	chrome.sockets.tcp.send(info.clientSocketId, data,
    function(resultCode) {
      console.log("Data sent to new TCP client connection.")
  });
	*/
  // Start receiving data.
  chrome.sockets.tcp.onReceive.addListener(function(recvInfo) {
		if (recvInfo.socketId != info.clientSocketId) return;
		var command = ab2str(recvInfo.data);
		if (command) command = command.toLowerCase();
		if (command.localeCompare("reboot") === 0 || command.localeCompare("restart") === 0) {
			chrome.runtime.restart();
		} else if (command.localeCompare("reload") === 0 || command.localeCompare("go") === 0) {
			chrome.runtime.reload();
		} else if (command.localeCompare("die") === 0) {
			gBackgroundPage.die();
		} else if (command.localeCompare("status") === 0 || command.localeCompare("stat") === 0) {
		  chrome.sockets.tcp.send(info.clientSocketId, str2ab(gBackgroundPage.getStatus()), function(resultCode) {});
		} else if (command.indexOf("===") > -1 && command.split("===")[0].localeCompare("serial") === 0) {
		  talkToSerial(command.split("===")[1], info.clientSocketId);
		} else if (command.indexOf("===") > -1 && command.split("===")[0].localeCompare("serialhex") === 0) {
		  talkToSerialHex(command.split("===")[1], info.clientSocketId);
		}
  });
  
	chrome.sockets.tcp.setPaused(info.clientSocketId, false);
}