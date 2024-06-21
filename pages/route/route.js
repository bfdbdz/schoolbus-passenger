// pages/route/route.js
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		route: [
			"长安->友谊 西万路",
			"长安->友谊 西太路",
			"友谊->长安 西万路",
			"友谊->长安 西太路"
		],
		index: undefined,
		timeList: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
		time: '',
		date: '',
		selected: null,
		taskList: [],
		showChoice: true,
		showBtn: Boolean,
		showNoChoose: Boolean,
		dataToPass: "okok"
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.getTask()
	},

	bindDateChange(e) {
		this.setData({
			date: e.detail.value
		})
		console.log('选择日期', this.data.date)
		this.getTask()
	},

	bindTimeChange: function (e) {
		this.setData({
			time: e.detail.value
		})
		console.log('选择时间', this.data.timeList[this.data.time])
		this.getTask()
	},

	bindRouteChange(e) {
		this.setData({
			index: e.detail.value
		})
		console.log('选择路线', Number(this.data.index) + 1)
		this.getTask()
	},

	getTask() {
		let params = {}
		console.log("选择date", this.data.date)
		console.log("选择time", this.data.timeList[this.data.time])
		console.log("选择number", this.data.index)
		if (this.data.index != undefined && this.data.index != null) {
			params.number = Number(this.data.index) + 1
		}
		if (this.data.date != '' && this.data.timeList[this.data.time] != null) {
			params.time = this.data.date + " " + this.data.timeList[this.data.time] + ":00"
		}
		if (this.data.date != '' && this.data.timeList[this.data.time] == null) {
			wx.showToast({
				title: '请选择一个时间进行查询',
				icon: 'none',
				mask: 'true',
				duration: 1000
			})
		}
		if (this.data.date == '' && this.data.timeList[this.data.time] != null) {
			wx.showToast({
				title: '请选择一个日期进行查询',
				icon: 'none',
				mask: 'true',
				duration: 1000
			})
		}
		wx.request({
			url: 'http://localhost:8080/passenger/task',
			method: 'GET',
			data: params,
			success: (res) => {
				console.log("可选择的路线", res.data.data)
				this.setData({
					taskList: res.data.data
				})
				this.checkRoute()
				this.checkBtn()
			},
			fail: (res) => {
				console.log(res)
			}
		})
	},

	clearDate() {
		this.setData({
			date: ''
		})
		this.getTask()
	},

	clearTime() {
		this.setData({
			time: ''
		})
		this.getTask()
	},

	clearRoute() {
		this.setData({
			index: null
		})
		this.getTask()
	},

	checkRoute() {
		let taskList = this.data.taskList
		if (taskList != null) {
			for (let i = 0; i < Object.keys(taskList).length; i++) {
				switch (taskList[i]['number']) {
					case 1:
						taskList[i].route = "长安->友谊 西万路"
						break;
					case 2:
						taskList[i].route = "长安->友谊 西太路"
						break;
					case 3:
						taskList[i].route = "友谊->长安 西万路"
						break;
					case 4:
						taskList[i].route = "友谊->长安 西太路"
						break;
				}
			}
			this.setData({
				taskList: taskList
			})
			console.log("获取路线名", this.data.taskList)
		}
	},

	checkBtn() {
		if (JSON.stringify(this.data.taskList) === "[]" || this.data.taskList == null) {//没有对应路线
			if (this.data.date.length == 0 && this.data.time.length == 0 && this.data.index == null) {//填了筛选条件
				this.setData({
					showBtn: false,
					showNoChoose: false
				})
			} else {
				this.setData({
					showBtn: false,
					showNoChoose: true
				})
			}
		} else {
			this.setData({
				showBtn: true,
				showNoChoose: false
			})
		}
		console.log("显示按钮", this.data.showBtn)
		console.log("显示无所选班次", this.data.showNoChoose)
	},

	chooseTask(e) {
		const index = e.currentTarget.dataset.index
		this.setData({
			selected: index
		})
		console.log(this.data.selected)
	},

	confirmTask() {
		if (this.data.selected == null) {
			console.log('未选择工单')
			wx.showToast({
				title: '请先选择一个工单',
				icon: 'none',
				mask: 'true',
				duration: 1000
			})
		} else {
			let choice = this.data.taskList[this.data.selected]
			console.log("选择执行的工单", choice)
			let id = choice['id']
			wx.request({
				url: 'http://localhost:8080/passenger/task/' + id,
				method: 'PUT',
				header: {
					'content-type': 'application/json',
					'Authorization': app.globalData.userInfo.userInfo.token
				},
				success: (res) => {
					if (res.statusCode == 200) {
						if (res.data.code === 200) {
							// 更新乘客信息
							this.getPassengerInfo()
							this.createLocationTimer()
							this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this)
							app.$on('socketMessage', this.handleWebSocketMessage)
							wx.showToast({
								icon: 'none',
								title: '选择成功！',
								mask: true,
								duration: 1000
							})
							setTimeout(() => {
								this.setData({
									showChoice: false,
								})
							}, 1000);
						}
					}
					console.log(res)
				},
				fail: (res) => {
					console.log(res)
				}
			})
		}
	},


	getPassengerInfo() {
		wx.request({
			url: 'http://localhost:8080/passenger/current',
			method: 'GET',
			header: {
				'content-type': 'application/json',
				'Authorization': app.globalData.userInfo.userInfo.token
			},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.code === 200) {
						console.log("获取乘客路线id", res)
						const newUserInfo = {
							number: res.data.data.number,
							routeId: res.data.data.routeId
						}
						const userInfoPast = app.globalData.userInfo.userInfo
						const userInfo = {
							...userInfoPast,
							...newUserInfo
						}
						console.log("更新后的乘客信息", userInfo)
						//更新本地存储
						wx.setStorage({
							key: 'userInfo',
							userInfo
						})
						//更新全局数据
						app.globalData.userInfo = {
							userInfo
						}
						console.log("全局数据更新成功？", app.globalData.userInfo.userInfo)
					}
				}
			},
			fail: (err) => {
				//请求失败
				console.log("获取乘客最新信息失败", err);
			}
		})
	},

	//创建定时器
	createLocationTimer() {
		this.getLocationAndSpeed()
		this.getCurrentTime()
		this.timer = setInterval(() => {
			this.getLocationAndSpeed()
			this.getCurrentTime()
		}, 60000) // 60000毫秒 = 1分钟
	},

	// 请求定位权限
	requestLocationPermission() {
		return new Promise((resolve, reject) => {
			//用户之前是否已经授权过
			wx.authorize({
				scope: 'scope.userLocation',
				success: () => {
					console.log('Authorize success')
					resolve(1)
				},
				fail: (err) => {
					console.log('Authorize error:', err)
					wx.showModal({
						title: '定位权限请求',
						content: '进行乘车需要获取您的位置信息,请授权后再使用',
						showCancel: true,
						confirmText: '确定',
						cancelText: '拒绝',
						confirmColor: '#6587b5',
						success: function (res) {
							if (res.confirm) {
								resolve(1)
							} else if (res.cancel) {
								wx.showToast({
									icon: 'none',
									title: '您拒绝了定位授权，我们无法为您提供服务',
									duration: 1000,
									mask: true
								})
								resolve(0)
							}
						}
					})
				}
			})
		})
	},

	// 获取用户位置和速度
	getLocationAndSpeed() {
		this.requestLocationPermission().then(permission => {
			console.log('Permission result:', permission);
			if (permission == 1) {
				wx.getLocation({
					type: 'gcj02', // 返回可以用于 wx.openLocation 的坐标
					success: (res) => {
						console.log("获取位置", res)
						// this.setData({
						// 	latitude: res.latitude,
						// 	longitude: res.longitude,
						// 	// speed: res.speed,
						// 	markers: [{
						// 		id: 0,
						// 		latitude: res.latitude,
						// 		longitude: res.longitude,
						// 		width: 20,
						// 		height: 30
						// 	}]
						// })
						// console.log("纬度", this.data.latitude)
						// console.log("经度", this.data.longitude)
						// console.log("速度", this.data.speed)
						// console.log("markers", this.data.markers)
						this.uploadLocationAndSpeed(res.latitude, res.longitude, res.speed, this.data.currentTime)
					},
					fail: (err) => {
						console.error('获取位置信息失败:', err)
						wx.showModal({
							title: '获取位置信息失败',
							content: JSON.stringify(err),
							showCancel: false
						})
					}
				})
			}
		})

	},

	// 上传用户定位和速度
	uploadLocationAndSpeed(latitude, longitude, speed, time) {
		wx.request({
			url: 'http://localhost:8080/passenger/location',
			header: {
				'Authorization': app.globalData.userInfo.userInfo.token
			},
			method: 'POST',
			data: {
				latitude,
				longitude,
				speed,
				time
			},
			success: (res) => {
				console.log('上传成功:', res.data)
			},
			fail: (err) => {
				console.error('上传失败:', err)
				wx.showToast({
					title: '请求失败，请检查网络',
					icon: 'error',
					mask: true,
					duration: 1000
				})
			}
		})
	},

	// 获取当前时间
	getCurrentTime() {
		let time = new Date();

		// 提取时和分
		let hours = time.getHours();
		let minutes = time.getMinutes();

		// 将时间格式化为字符串
		this.setData({
			currentTime: `${hours}:${minutes.toString().padStart(2, '0')}`
		})

		console.log("时间", time)
		console.log(hours)
		console.log(minutes)
		console.log(this.data.currentTime)
	},

	handleWebSocketMessage(message) {
		console.log('收到的消息：', message);
		app.globalData.passengerStatus = 'on'
		this.clearLocationTimer() //人车拟合成功，停止上传数据
		this.getDriverId()//更新用户信息中driverId
		wx.showModal({
			title: '提示',
			content: '已识别到您在车上并自动为您进行扣费，请选择下车站点',
			showCancel: 'false',
			complete: (res) => {
				if (res.confirm) {
					this.refreshOtherPage()
					wx.switchTab({
						url: '../stop/stop',
					})
				}
			}
		})
	},

	getDriverId() {
		wx.request({
			url: 'http://localhost:8080/passenger/current',
			method: 'GET',
			header: {
				'content-type': 'application/json',
				'Authorization': app.globalData.userInfo.userInfo.token
			},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.code === 200) {
						console.log("获取用户匹配司机id", res)
						const newUserInfo = {
							driverId: res.data.data.driverId
						}
						const userInfoPast = app.globalData.userInfo.userInfo
						const userInfo = {
							...userInfoPast,
							...newUserInfo
						}
						console.log("更新后的匹配信息", userInfo)
						this.setData({
							userInfo: userInfo
						})
						//更新本地存储
						wx.setStorage({
							key: 'userInfo',
							userInfo
						})
						//更新全局数据
						app.globalData.userInfo = {
							userInfo
						}
						console.log("全局数据driverId更新成功？", app.globalData.userInfo.userInfo)
					}
				}
			},
			fail: (err) => {
				//请求失败
				console.log("获取匹配信息失败", err);
			}
		})
	},

	refreshOtherPage() {
		const pages = getCurrentPages();
		const refreshPage = pages.find(page => page.route === 'pages/stop/stop');
		console.log("refreshpage")
		console.log(pages)
		console.log(refreshPage)
		if (refreshPage) {
			console.log("刷新站点页面")
			refreshPage.onShow();
		}
	},

	cancelTask() {
		var geton = app.globalData.userInfo.userInfo.getonStationName
		var getoff = app.globalData.userInfo.userInfo.getoffStationName
		console.log(geton)
		console.log(getoff)
		wx.request({
			url: 'http://localhost:8080/passenger/task/cancel?getonStationName=' + geton + '&getoffStationName=' + getoff,
			method: 'PUT',
			header: {
				'content-type': 'application/json',
				'Authorization': app.globalData.userInfo.userInfo.token
			},
			success: (res) => {
				if (res.statusCode == 200) {
					if (res.data.code === 200) {
						this.clearLocationTimer() //清除定时器
						// 更新乘客信息
						this.deletePassengerInfo()
						this.setData({
							showChoice: true
						})
						wx.showToast({
							icon: 'none',
							title: '取消成功',
							mask: true,
							duration: 2000
						});
						this.getTask()
					}
				}
				console.log(res)
			},
			fail: (res) => {
				console.log(res)
			}
		})
	},

	// 销毁定时器
	clearLocationTimer() {
		clearInterval(this.timer)
	},

	deletePassengerInfo() {
		const {
			number,
			routeId,
			getonStationName,
			getoffStationName,
			driverId,
			...rest
		} = app.globalData.userInfo.userInfo
		const userInfo = rest
		console.log("更新后的乘客信息", userInfo)
		//更新本地存储
		wx.setStorage({
			key: 'userInfo',
			userInfo
		})
		//更新全局数据
		app.globalData.userInfo = {
			userInfo
		}
		console.log("全局数据更新成功？", app.globalData.userInfo.userInfo)
	},

	gotoGeton() {
		wx.switchTab({
			url: '/pages/stop/stop',
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {
		this.clearLocationTimer()
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})