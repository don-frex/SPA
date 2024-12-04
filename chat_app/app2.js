class ChatComponent {
	constructor(containerId) {
	  this.containerId = containerId;
	  this.friends = [];
	  this.notificationSocket=null;
	  this.renderChat();
	}
  
	// Function to render the entire chat UI
	renderChat() {
	  const chatApp = document.getElementById(this.containerId);
  
	  chatApp.innerHTML = `
		<div class="chat_app-container">
		  <!-- Sidebar -->
		  <div class="chat_sidebar">
			<div class="chat_search-bar">
			  <input type="text" class="chat_search-input" placeholder="Search...">
			  <button class="chat_search-btn" disabled>
				Search<i class="fa fa-search"></i>
			  </button>
			</div>
			<ul id="chat_friends" class="chat_friend-list">
			  <!-- Friends list will be populated here -->
			</ul>
		  </div>
  
		  <!-- Chat Area -->
		  <div class="chat_chat-area">
			<div class="chat_chat-header">
			  <h3 class="chat_chat-title">Select a friend to chat</h3>
			  <div class="chat_header-icons">
				<!-- Connected Person Icon -->
				<div id="chat_connected-icon" class="chat_icon" title="Connected Person">
				  <i class="fa fa-user-circle"></i>
				</div>
				<!-- New Message Notification Icon -->
				<div id="chat_notification-icon" class="chat_icon" title="New Message">
				  <i class="fa fa-bell"></i>
				</div>
			  </div>
			</div>
			<div class="chat_chat-window">
			 
			</div>
			<div class="chat_chat-input-area">
			  <input type="text" class="chat_chat-input" placeholder="Type a message...">
			  <button class="chat_send-btn">Send</button>
			</div>
		  </div>
  
		  <!-- Contact Details -->
		  <div class="chat_contact-details">
			<img id="chat_contact-avatar" src="avatar1.jpg" alt="Contact Avatar">
			<div class="chat_contact-info">
			  <h3 id="chat_contact-name">Friend Name</h3>
			  <p id="chat_contact-email">Email: example@mail.com</p>
			  <p id="chat_contact-phone">Phone: +123456789</p>
			  <button class="chat_action-btn">Show Profile</button>
			  <button id="chat_block" class="chat_action-btn">Block</button>
			  <button class="chat_action-btn">Invite Game</button>
			</div>
		  </div>
		</div>
	  `;
  
	  // Initialize the friends list and background particles
	  this.addBulletParticles();
	  this.setupNotificationListeners(); // Now added here
    setTimeout(() => this.setupSearchListener(), 200);
	  this.setupSearchListener();
	}
  setupSearchListener() {
    const searchInput = document.querySelector(".chat_search-input");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchQuery = e.target.value.toLowerCase().trim();

            if (searchQuery === "") 
            {
                this.populateFriendList(this.friends);
            } 
            else 
            {
                const filteredFriends = this.friends.filter(friend =>
                    friend.name.toLowerCase().includes(searchQuery)
                );
                this.populateFriendList(filteredFriends);
            }
        });
    } else {
        console.error("Search input not found");
    }
}



  populateFriendList(friendsList = this.friends) {
    const friendListElement = document.querySelector("#chat_friends");
    const currentStates = {};

    document.querySelectorAll(".chat_friend").forEach((friendElement) => {
        const id = friendElement.dataset.id;
        currentStates[id] = {
            friendIconDisplay: friendElement.querySelector(`.chat_friend-icon${id}`).style.display,
            messageIconDisplay: friendElement.querySelector(`.chat_message-icon${id}`).style.display,
        };
    });

    friendListElement.innerHTML = "";

    friendsList.forEach((friend) => {
        const friendElement = document.createElement("li");
        friendElement.className = "chat_friend";
        friendElement.dataset.id = friend.id;
        friendElement.dataset.name = friend.name || "Unnamed";
        friendElement.dataset.authid = friend.auth_user_id;
        friendElement.dataset.authname = friend.auth_user_name;
        friendElement.innerHTML = `
          <div class="chat_avatar-container">
            <img class="chat_avatar" src="${friend.imageURL}" alt="${friend.name}">
          </div>
          <span class="chat_friend-name">${friend.name}</span>
          <span class="chat_friend-icon chat_friend-icon${friend.id}" style="display:none">🟢</span>
          <span class="chat_message-icon chat_message-icon${friend.id}" style="display:none">🔔</span>
        `;

        // Restore display states intelligently
        const friendIcon = friendElement.querySelector(`.chat_friend-icon${friend.id}`);
        const messageIcon = friendElement.querySelector(`.chat_message-icon${friend.id}`);

        if (currentStates[friend.id]) {
            friendIcon.style.display = currentStates[friend.id].friendIconDisplay === "none" ? "none" : "inline";
            messageIcon.style.display = currentStates[friend.id].messageIconDisplay === "none" ? "none" : "inline";
        }

        friendElement.addEventListener("click", () => this.showContactDetails(friend));
        friendListElement.appendChild(friendElement);
    });

    if (friendsList.length === 0) {
        friendListElement.innerHTML = "<li>No matching friends found.</li>";
    }
}

	showContactDetails(friend) 
  {
	  document.getElementById("chat_contact-avatar").src = friend.imageURL;
	  document.getElementById("chat_contact-name").textContent = friend.name;
	  document.getElementById("chat_contact-email").textContent = `Email: ${friend.email}`;
	  document.getElementById("chat_contact-phone").textContent = `Phone: ${friend.phone}`;
  
	  // Update Connected Person Icon Tooltip
	  const connectedIcon = document.getElementById("chat_connected-icon");
	  connectedIcon.setAttribute("title", `Connected with ${friend.name}`);
  
	  // Highlight selected friend
	  const friendsListItems = document.querySelectorAll(".chat_friend");
	  friendsListItems.forEach((item) => item.classList.remove("chat_selected"));
	  const selectedFriend = document.querySelector(`.chat_friend[data-id='${friend.id}']`);
	  selectedFriend.classList.add("chat_selected");
	  const blockButton = document.getElementById("chat_block");
    if (blockButton) {
        blockButton.onclick = function() {
            fetch(`http://127.0.0.1:8000/api/block_friend/${friend.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensure session authentication
            })
            .then(response => {
                if (response.ok) {
                    const contactInfo = document.getElementById('chat_contact-info');
                    if (contactInfo) {
                        contactInfo.innerHTML = '';  // Clear contact details
                    }
                    alert(`You have successfully blocked ${friend.name}`);

                    // Remove blocked friend from the friends list
                    const friendItem = document.querySelector(`.chat_friend[data-id='${friend.id}']`);
                    if (friendItem) {
                        friendItem.style.display = 'none';  // Hide the blocked friend
                    }

                    // Optionally, remove the contact image as well
                    const contactImage = document.getElementById('chat_contact-avatar');
                    if (contactImage) {
                        contactImage.parentElement.removeChild(contactImage);  // Remove the image
                    }

                    // Remove friend from the internal list (if needed)
                    chatComponent.friends = chatComponent.friends.filter(f => f.id !== friend.id);
                } else {
                    return response.json().then(data => {
                        alert(`Failed to block ${friend.name}: ${data.message}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error blocking friend:', error);
                alert('There was an error blocking the friend. Please try again later.');
            });
        };
    }
	}
  
	// Function to set up listeners for the notification icon
	setupNotificationListeners() 
  {
	  const notificationIcon = document.getElementById("chat_notification-icon");
	  notificationIcon.addEventListener("click", () => {
		this.clearNotificationBadge(); // This will reset the notification count
	  });
	}
  
	// Function to clear the notification badge (if needed)
	clearNotificationBadge() {
	  const notificationBadge = document.getElementById("chat_notification-badge");
	  notificationBadge.textContent = "0";
	  notificationBadge.style.display = "none";
	}
  
	// Function to add bullet particles in the background
	addBulletParticles() {
	  for (let i = 0; i < 30; i++) {
		const bullet = document.createElement("div");
		bullet.classList.add("chat_bullet", `chat_bullet-${i % 4 + 1}`);
		bullet.style.left = `${Math.random() * 100}%`;
		bullet.style.animationDuration = `${Math.random() * 2 + 1}s`;
		document.body.appendChild(bullet);
	  }
	}
	// setupSearchListener() {
  //       const searchInput = document.getElementById("chat_search-input");
  //       searchInput.addEventListener("input", (e) => {
  //           const searchQuery = e.target.value.toLowerCase();
  //           const filteredFriends = this.friends.filter((friend) =>
  //               friend.name.toLowerCase().includes(searchQuery)
  //           );
  //           this.populateFriendList(filteredFriends);
  //       });
  //   }
  }
  
  // Initialize the chat component
  const chatComponent = new ChatComponent("chat-app");
  
  // Fetch and populate friends list from the server
  async function fetchData() {
	try {
	  const response = await fetch("http://127.0.0.1:8000/list_friends/", {
		method: "GET",
		credentials: 'include',
	  });
  
	  if (!response.ok) {
		throw new Error(`Failed to fetch data, status: ${response.status}`);
	  }
  
	  const userData = await response.json();
	  if (userData && Array.isArray(userData) && userData.length > 0) {
		const authUser = userData[0];
		const auth_user_id_v = authUser.id_auth;
		const auth_user_name_v = authUser.auth_username;
  
		friends = userData.map(user => ({
		  id: user.id_friend,
		  name: user.username || '', 
		  email: user.email || '',
		  phone: user.phone || '',
		  imageURL: user.avatar || 'default-avatar.jpg', 
		  auth_user_id: auth_user_id_v,
		  auth_user_name: auth_user_name_v
		}));
  
		if (Array.isArray(friends))
		  console.log('friends is an array');
		else
		  console.log('friends is NOT an array');
  
		// Filter friends if necessary
		const filteredFriends = friends.filter(friend => friend.id !== undefined);
		
		// Populate the friend list with updated data
		chatComponent.friends = filteredFriends; // Update the friends array in chatComponent
		chatComponent.populateFriendList(); // Populate the friend list after data is fetched
	  } else {
		document.querySelector("#friends").innerHTML = 'No users found.';
	  }
	} catch (error) {
	  console.error('Error fetching data:', error);
	  document.querySelector("#friends").innerHTML = 'An error occurred while fetching your friends.';
	}
  }
  function isMessageEmpty(message) 
  {
	return !message.trim(); // Returns true if the message is empty or contains only whitespace
	}
  async function sockethandle() {
    // let notificationSocket = null;
    let chatSocket = null;
    let sender = null;
    let reciever = null;
    let sendername = null;
    let recievername = null;
    // const connectSocket = null;

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const connectSocket = new WebSocket(protocol + '127.0.0.1:8000' + '/ws/second/');
    sender = document.querySelector('.chat_friend').getAttribute('data-authid');
    notificationSocket = new WebSocket(protocol + '127.0.0.1:8000' + '/ws/' + sender + '/');
    connectSocket.onopen = function() {
        console.log("WebSocket connection opened");
        connectSocket.send(JSON.stringify({
            'sender': sender,
            'status': "connected",
        }));
    };
    notificationSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log(data.sender);
        const paragraph = document.querySelector('span.chat_message-icon' + data.sender);
        console.log(data);
        if (paragraph)
            paragraph.style.display = 'block'; // Change background color to green
        else
            console.log('Element not found'); // Optional: log if the element is not found
    }
    document.querySelectorAll('span.chat_friend-icon').forEach(paragraph => 
    {
            paragraph.style.diplay = 'none'; // Show connected status
    });
	connectSocket.onmessage = function(e) 
    {
        const data = JSON.parse(e.data);

        document.querySelectorAll('span.chat_friend-icon').forEach(paragraph => 
        {
            paragraph.style.display = 'none';
        })
        data.connected_users.forEach(user => 
        {
            const paragraph = document.querySelector('span.chat_friend-icon'+ user.user_id);
            if (paragraph) 
            {
                paragraph.style.display = 'block';
            }
        });
	}
	const messageQueue = [];
	document.querySelectorAll('.chat_friend').forEach(link => {
        link.onclick = function(e) {
            e.preventDefault();

            reciever = this.getAttribute('data-id');
            sender = this.getAttribute('data-authid');
            recievername = this.getAttribute('data-name');
            sendername = this.getAttribute('data-authname');
            const paragraph = document.querySelector('span.notification' + reciever);

            if (paragraph)
                paragraph.style.display = 'none';
            else
                console.log('Element not found');

            let url;
            if (reciever > sender)
                url = protocol + '127.0.0.1:8000' + '/ws/chat/' + reciever + '/' + sender + '/';
            else
                url = protocol + '127.0.0.1:8000' + '/ws/chat/' + sender + '/' + reciever + '/';

            if (chatSocket) {
                chatSocket.close(); // Close any existing socket connection
            }

            chatSocket = new WebSocket(url);

            chatSocket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                console.log(data);

                const parent =	document.querySelector('.chat_chat-window');

                if (data.type === 'previous_messages') 
                {
					const children = parent.querySelectorAll('div');
					children.forEach(child => {
					if (!child.classList.contains('chat-chat-input-area')) {
						child.remove();
						}
					});
                    
                    data.messages.forEach(msg => {
                        const newDiv = document.createElement('div');
                        if (msg.senderj != sender) 
                        {
                            newDiv.classList.add('chat_message', 'chat_sent');
                            newDiv.textContent = `${msg.authuser}: ${msg.message}`;
							
                        } 
                        else {
                            newDiv.classList.add('chat_message', 'chat_received');
                            newDiv.textContent = `me: ${msg.message}`;
                        }
                        parent.appendChild(newDiv);
						// const chatWindow = document.getElementById('chat_chat-window');
						// 	if (chatWindow) {
							parent.scrollTop = parent.scrollHeight;
							
                    });
                } else {
                    const newDiv = document.createElement('div');
                    if (data.senderj != sender) {
                        newDiv.classList.add('chat_message', 'chat_sent');
                        newDiv.textContent = `${data.authuser}: ${data.message}`;
                    } else {
                        newDiv.classList.add('chat_message', 'chat_received');
                        newDiv.textContent = `me: ${data.message}`;
                    }
                    parent.appendChild(newDiv);
					parent.scrollTop = parent.scrollHeight;
                }
            };

            chatSocket.onopen = function() {
                console.log("WebSocket connection established");
                while (messageQueue.length > 0) {
                    chatSocket.send(messageQueue.shift());
                }
            };

            chatSocket.onclose = function(e) {
                console.error('Chat socket closed unexpectedly');
            };
        };
    });
	document.querySelector('.chat_chat-input').focus();
    document.querySelector('.chat_chat-input').onkeyup = function(e) {
        if (e.keyCode === 13) 
		{
            e.preventDefault();

            const messageInputDom = document.querySelector('.chat_chat-input');
            const message = messageInputDom.value;

            if (!isMessageEmpty(message)) {
                if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.send(JSON.stringify({
                        'message': message,
                        'senderj': sender,
                        'reciever': reciever,
                        'authuser': sendername
                    }));

                    messageInputDom.value = '';  // Clear input field
                    console.log("Message sent");
                } else {
                    // If socket is not open yet, queue the message
                    console.log("WebSocket not open yet, queuing message...");
                    messageQueue.push(JSON.stringify({
                        'message': message,
                        'senderj': sender,
                        'reciever': reciever,
                        'authuser': sendername
                    }));
                }

                const notificationSocket1 = new WebSocket(protocol + '127.0.0.1:8000' + '/ws/' + reciever + '/');
                notificationSocket1.onopen = function() {
                    notificationSocket1.send(JSON.stringify({
                        'sender': sender,
                    }));
                };
            }
        }
    };

  }
  function hideSpanInListItem() {
    // Add a click event listener to the document
    document.addEventListener("click", (event) => {
        // Check if the clicked element is an <li> element with the class "chat_friend"
        if (event.target.closest(".chat_friend")) {
            const clickedLi = event.target.closest(".chat_friend");
            
            // Find the <span> with the class "chat_message-icon" inside the clicked <li>
            const spanToHide = clickedLi.querySelector(".chat_message-icon");
            
            // Hide the <span> if it exists
            if (spanToHide) {
                spanToHide.style.display = "none";
            }
        }
    });
}


  
  // Call this async function at the end to load everything correctly
  async function initializeChat() {
      try {
          await fetchData();
          await sockethandle();
		  hideSpanInListItem();
      } catch (error) {
          console.error('Error during initialization:', error);
      }
  }
  
  // Call the initializeChat function to load data and handle the socket connection
  initializeChat();
