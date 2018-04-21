(function($){

	$.App = function(options){

		var socket 			= io.connect('https://tienchat.herokuapp.com');
		var timeOutTyping 	= null;
		var iconsList 		= {
								'icon_devil'		:'3:)',
								'icon_angel'		:'O:)',
								'icon_smile' 		:':)',
								'icon_grumpy'		:'>:(',
								'icon_frown'		:':(',
								'icon_tongue'		:':P',
								'icon_grin'			:'=D',
								'icon_upset'		:'>:o',
								'icon_gasp'			:':o',
								'icon_wink'			:';)',
								'icon_pacman'		:':v',
								'icon_unsure'		:':/',
								'icon_cry'			:":'(",
								'icon_kiki'			:'^_^',
								'icon_glasses'		:'8-)',
								'icon_sunglasses'	:'B|',
								'icon_heart'		:'<3',
								'icon_squint'		:'-_-',
								'icon_confused'		:'o.O',
								'icon_colonthree'	:':3',
								'icon_like'			:'(y)'
							};
		Init();
		function Init(){
			authInit();

			roomInit();

			friendInit();
		}

		/* Login - Logout*/
		function authInit(){
			 authEvent();

			 authSocket();
		}
		function authEvent(){

			$('#usersList a.use').click(function(e){
				var id = $(this).data('id'); // <=> $(this).attr('data-id');
				$('.popup-loading').show();
				socket.emit('auth-login',id);
			});

			$('#logoutBtn').click(function(e){
				socket.emit('auth-logout');
			});
		}
		function authSocket(){

			socket.on('auth-visit',function(data){
				$.each(data,function(i,id){
					$('#usersList .user'+id).find('a.use').addClass('hide');
					$('#friendsList .user'+id).find('span.status').removeClass('hide');
				});
			});

			socket.on('auth-logged',function(data){
				$('#friendsList .user'+data.id).remove();
				$('#authName').text(data.name);
				$('#Popup').fadeOut('slow');
			});

			socket.on('auth-joined',function(data){

				$('#usersList .user'+data).find('a.use').addClass('hide');
				$('#friendsList .user'+data).find('span.status').removeClass('hide');
			});

			socket.on('auth-logout',function(data){
				window.location.href = "";
			});
			socket.on('auth-leaved',function(data){
				$('#usersList .user'+data).find('a.use').removeClass('hide');
				$('#friendsList .user'+data).find('span.status').addClass('hide');
			});
		}

		/* ROOM CHAT*/
		function roomInit(){
			roomEvent();

			roomSocket();
		}

		function roomEvent(){

			$('#roomSendBtn').click(function(){
				var msg = $('#room_message_content').val();
				$('#room_message_content').val('');
				socket.emit('room-message-send', msg );
			});
		}

		function roomSocket(){


			socket.on('room-message-new',function(data){
				console.log(data);
				var li = $('#templateRoomMessage').html();


				li = li.replace(/{AVATAR}/g,data.authInfo.avatar);
				li = li.replace(/{NAME}/g,data.authInfo.name);
				li = li.replace(/{CREATED}/g,data.msg.created);
				li = li.replace(/{MESSAGE}/g,data.msg.message);

				$('.message-room-list').append(li);

				$('.scrollableAreaWrap').scrollTop( $('.scrollableAreaContent').height() );
			});
		}

		/* FRIEND CHAT*/
		function friendInit(){
			friendEvent();

			friendSocket();
		}

		function friendEvent(){

			$('#friendsList a').click(function(e){


				//id,name,avatar
				var id 		= $(this).data('id');
				var name 	= $(this).children('span.name').text();
				var avatar 	= $(this).find('img').attr('src');

				if(!$('#chat'+id).length){
					friendWindowNew({id:id,name:name,avatar:avatar});
				}
				//Focus Case 1
				friendWindowFocus('#chat'+id,true);
			});


			/*$('#windowsChat li i.close').click(function(e){
				$(this).closest('li').remove();
			});*/
			$('body').on('click','#windowsChat li i.close',function(e){
				$(this).closest('li').remove();
			});

			$('body').on('click','#windowsChat li .titleBar h4',function(e){
				$(this).closest('li').toggleClass('off');
			});

			$('body').on({
				focus:function(e){
					if(!$(this).parent().parent().find(".conversation").find(".message:last-child").hasClass('me')) {
					friendWindowFocus($(this).closest('li'),false);

					if( $(this).closest('li').hasClass('new')){
						var li   = $(this).closest('li');

						var data = {
								    userId:$(li).data('id'),
								    messageId:$(li).find('.conversation .message:last').data('id')
								   };

						socket.emit('friend-message-viewed',data);
					}
				}
				},
				keydown:function(e){
					if(e.keyCode == 13 && $.trim($(this).val()) != ''){
						var data = {id:$(this).closest('li').data('id'),
									message:$.trim($(this).val())};
						//Show Message
						friendMessageNew(data,true);
						//Emit to Server
						socket.emit('friend-message-send',data);
						//$(".windowsChat .viewed").hide();
					}else{
						var id = $(this).closest('li').data('id');
						friendTyping(id);
					}
				}

			},'#windowsChat li input.input');

			$('body').on('click','a.toggleIcon',function(e){
				$(this).closest('.emoticonsPanel').toggleClass('open');
			});

			$('body').on('click','.iconItem a.icon',function(e){

				var cl 		= $(this).attr('class').split(' ')[1];
				var chars 	= iconsList[cl];
				var input   = $(this).closest('.layoutSubmit').children('input.input');
				$(input).val( $(input).val() + ' ' +chars+' ' );

				$(this).closest('.emoticonsPanel').removeClass('open');
			});
		}


		function friendSocket(){

			//Sự kiện này dành cho user nhận tin nhắn
			socket.on('friend-message-new',function(data){
				if(!$('#chat'+data.id).length){
					//avatarUrl: "images/avatar/1.jpg"
					var dataWindow = $.extend(false,data,{avatar:'images/avatars/'+data.avatar});
					friendWindowNew(dataWindow);
				}
				//Show Message
				friendMessageNew(data,false);
			});

			socket.on('friend-typing',function(id){
				if($('#chat'+id).length){
					$('#chat'+id).find('.typing').show();
				}
			});

			socket.on('friend-typing-stop',function(id){
				if($('#chat'+id).length){
					$('#chat'+id).find('.typing').hide();
				}
			});

			socket.on('friend-message-viewed',function(data){
				if($('#chat'+data.id).length){
					//$('#chat'+data.id).find('.viewed').show().children('span').text(data.created);
					$("#chat"+data.id).find(".conversation").find(".viewed").remove();
					let html = `<div class="viewed">
									<i></i> Đã xem lúc <span></span>
								</div>`;
					$("#chat"+data.id).find(".conversation").append(html);
					$("#chat"+data.id).find(".viewed").children('span').text(data.created)
				}
			});

		}

		/*FRIEND FUNCTIONS*/
		function friendWindowNew(data){
			var li = $('#templateChatWindow').html();
			li = li.replace(/{ID}/g,data.id);
			li = li.replace(/{AVATAR}/g,data.avatar);
			li = li.replace(/{NAME}/g,data.name);
			$('#windowsChat').append(li);
		}

		function friendWindowFocus(selector,focusInput){

			$('#windowsChat').children('li').removeClass('focus');
			$(selector).addClass('focus');
			if(focusInput) $(selector).find('input.input').focus();
		}

		function friendMessageNew(data,me){
			var li = $('#chat'+data.id);

			if(me == true){
				var div = $('#templateChatMessageMe').html();
				li.find('input.input').val('');
			}else{
				var div = $('#templateChatMessageFriend').html();
				div = div.replace(/{AVATAR}/g,data.avatar);
				div = div.replace(/{NAME}/g,data.name);
				div = div.replace(/{ID}/g,data.messageId);
			}
			data.message = friendMessageConvertIcons(data.message);
			div = div.replace(/{MESSAGE}/g,data.message);

			li.find('.conversation').append(div).end()
			  .find('.layoutBody').scrollTop(li.find('.conversation').height());


			if(me == false){
				li.addClass('new');
			}
		}

		function friendTyping(id){
			socket.emit('friend-typing',id);

			clearTimeout(timeOutTyping);
			timeOutTyping = setTimeout(function(){
				socket.emit('friend-typing-stop',id);
			},2000)
		}

		function friendMessageConvertIcons(value){
			// <3 => <span class="icon icon_heart"></span>
			$.each(iconsList,function(cl,char){
				if(value.indexOf(char) >= 0){

					char = char.replace(/\(/g,'\\(')
					           .replace(/\)/g,'\\)')
					           .replace(/\^/g,'\\^')
					           .replace(/\|/g,'\\|');

					var regex = new RegExp(char,"g");
					value = value.replace(regex,'<span class="icon '+cl+'"></span>');
				}
			});
			return value;
		}
	}


})(jQuery);

$(document).ready(function(e){
	$.App();
});
