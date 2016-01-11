function listenAndAccept(socketId) {
	  netInterfaces().then(function(interfaces) {
			$.each(interfaces, function(i, interface) {
					// Only run for IPv4
					if (interface.address.indexOf(".") >= 0) {
						console.log("Listening On 8080 / " + interface.address);
						chrome.sockets.tcpServer.listen(socketId,
							interface.address, 8080, function(resultCode) {
								console.log(resultCode);
								onListenCallback(socketId, resultCode)
						});
						return false;
					}
			});
		});
}

var serverSocketId;
function onListenCallback(socketId, resultCode) {
  if (resultCode < 0) {
    console.log("Error listening:" +
      chrome.runtime.lastError.message);
    return;
  }
  serverSocketId = socketId;
	console.log("Listening On Socket ID: " + socketId);
  chrome.sockets.tcpServer.onAccept.addListener(onAccept);
}

function onAccept(info) {
  if (info.socketId != serverSocketId) {
		console.log(info.socketId + "!==" + serverSocketId);
    return;
	}
		
	console.log("Connected ... to " + info.peerAddress + " [" + info.peerPort + "]");
	
  // A new TCP connection has been established.
  /*
	chrome.sockets.tcp.send(info.clientSocketId, data,
    function(resultCode) {
      console.log("Data sent to new TCP client connection.")
  });
	*/
  // Start receiving data.
  chrome.sockets.tcp.onReceive.addListener(function(recvInfo) {
    console.log("Receiving ...");
		if (recvInfo.socketId != info.clientSocketId) {
			console.log(recvInfo.socketId + "!==" + info.clientSocketId);
			return;
		}
		var command = ab2str(recvInfo.data);
		if (command.localeCompare("reboot") === 0) {
			console.log("Restarting");
			chrome.runtime.restart();
		} else if (command.localeCompare("reload") === 0) {
			chrome.runtime.reload();
		}
		console.log(command);
  });
  
	chrome.sockets.tcp.setPaused(info.clientSocketId, false);
}