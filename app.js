// app.js
let eventCenter = {}
App({
	globalData: {
		userInfo: {}
	},

	// eventBus:new Vue(),

	onLaunch() {

		// setTimeout(() => {
		// 	wx.showModal({
		// 		title: '提示',
		// 		content: '已识别到您在车上并自动为您进行扣费，请选择下车站点',
		// 		showCancel: 'false',
		// 		complete: (res) => {
		// 			if (res.confirm) {
		// 				const pages = getCurrentPages();
		// 				const refreshPage = pages.find(page => page.route === 'pages/stop/stop');

		// 				console.log("refreshPage",refreshPage)
		// 				console.log(pages)
		// 				if (refreshPage) {
		// 					console.log("show了show了show了show了")
		// 					refreshPage.onShow();
		// 				}
		// 				wx.switchTab({
		// 					url: '/pages/stop/stop',
		// 				})
		// 			}
		// 		}
		// 	})

		// }, 30000)

		// 展示本地存储能力
		const logs = wx.getStorageSync('logs') || []
		logs.unshift(Date.now())
		wx.setStorageSync('logs', logs)

		this.getUserInfo()

		// this.initWebSocket()
	},

	//获取用户信息
	//用户进入这个页面时肯定已经登录，所以本地缓存一定有用户信息
	getUserInfo() {
		// 从本地缓存中读取用户信息
		const userInfo = wx.getStorageSync('userInfo')
		if (userInfo) {
			// 如果本地缓存中有用户信息,则将其保存到全局数据中
			this.globalData.userInfo = userInfo
			console.log("app userInfo已有", this.globalData.userInfo)
		} else {
			// 如果本地缓存中没有用户信息,则等待下次更新时再读取
			this.waitForUserInfoUpdate()
		}

	},

	// 每隔 5 秒检查一次本地缓存,看是否有用户信息更新
	waitForUserInfoUpdate() {
		// 每隔 5 秒检查一次本地缓存,看是否有用户信息更新
		this.checkUserInfoTimer = setInterval(() => {
			const userInfo = wx.getStorageSync('userInfo')
			if (userInfo) {
				// 如果本地缓存中有用户信息,则将其保存到全局数据中
				this.globalData.userInfo = userInfo
				// 停止定时器
				clearInterval(this.checkUserInfoTimer)
				console.log("app userInfo更新", this.globalData.userInfo)
			}
		}, 5000);
	},

	initWebSocket() {
		if (this.globalData.userInfo) {
			const id = this.globalData.userInfo.userInfo.id
			this.socketTask = wx.connectSocket({
				url: 'ws://localhost:8080/ws/passenger_' + id,
				header: {
					'content-type': 'application/json'
				},
				method: 'GET'
			})
			console.log("wsURL", 'wss://localhost:8080/ws/passenger_' + id)
		}

		this.socketTask.onOpen(function () {
			console.log('WebSocket 连接已打开')
		})

		this.socketTask.onMessage((res) => {
			let data = JSON.parse(res.data)
			console.log('收到服务器数据：', data)
			// 人车拟合消息
			if (data.type == 1) {
				this.$emit('socketMessage', data)
			}
			// 前方到站提醒
			else if (data.type == 2) {
				console.log("播放音频")
				wx.setInnerAudioOption({
					obeyMuteSwitch: 'false'
				})
				const innerAudioContext = wx.createInnerAudioContext({
					useWebAudioImplement: false
				})
				switch (data.message) {
					case 'changan':
						console.log("选择长安音频")
						innerAudioContext.src = "/audio/changan.mp3"
						break;
					case 'gaoxin':
						innerAudioContext.src = "/audio/gaoxin.mp3"
						break;
					case 'guojiyi':
						innerAudioContext.src = "/audio/guojiyi.mp3"
						break;
					case 'laodong':
						innerAudioContext.src = "/audio/laodong.mp3"
						break;
					case 'youyi':
						innerAudioContext.src = "/audio/youyi.mp3"
						break;
					case 'ziwei':
						innerAudioContext.src = "/audio/ziwei.mp3"
						break;
					default:
						break;
				}
				console.log("播放长安")
				innerAudioContext.play()
				// innerAudioContext.destroy()
			}
		})

		wx.onSocketError((res) => {
			console.error('WebSocket连接发生错误：', res.errMsg)
		})

		wx.onSocketClose((res) => {

			console.log('WebSocket连接已关闭')
		})
	},
	// 事件中心方法
	$on(eventName, callback) {
		console.log("app.$on")
		if (!eventCenter[eventName]) {
			eventCenter[eventName] = []
		}
		eventCenter[eventName].push(callback)
	},
	$off(eventName, callback) {
		console.log("app.$off")
		if (eventCenter[eventName]) {
			eventCenter[eventName] = eventCenter[eventName].filter(cb => cb !== callback)
		}
	},
	$emit(eventName, ...args) {
		console.log("app.$emit")
		if (eventCenter[eventName]) {
			eventCenter[eventName].forEach(cb => cb(...args))
		}
	}

})
