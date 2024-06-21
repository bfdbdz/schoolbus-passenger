// pages/stop/stop.js
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		getonSataion: [],
		getoffStation: [],
		onSelected: null,
		offSelected: null,
		showNoRoute: Boolean,
		showOnContainer: Boolean,
		showNoBus: true,
		showOffContainer: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

	},

	gotoRoute() {
		wx.switchTab({
			url: '/pages/route/route',
		})
	},

	handleOnStationClick(e) {
		const index = e.currentTarget.dataset.index;
		this.setData({
			onSelected: index,
		});
		console.log("选择的序号", index)
		console.log("选择的站点", this.data.getonStation[this.data.onSelected])
	},

	checkChoice(choice) {
		var stationChoice
		switch (choice) {
			case "长安校区乘车点":
				stationChoice = 'changan'
				break;
			case "长安校区东门":
				stationChoice = 'dongmen'
				break;
			case "国际医学中心":
				stationChoice = 'guojiyi'
				break;
			case "紫薇":
				stationChoice = 'ziwei'
				break;
			case "高新":
				stationChoice = 'gaoxin'
				break;
			case "劳动南路":
				stationChoice = 'laodong'
				break;
			case "友谊校区":
				stationChoice = 'youyi'
				break;
			case "云天苑":
				stationChoice = 'yun'
				break;
			case "教学西楼":
				stationChoice = 'jiaoxi'
				break;
			case "海天苑":
				stationChoice = 'hai'
				break;
			case "启翔楼":
				stationChoice = 'qixiang'
				break;
			default:
				console.log('未选择站点')
				wx.showToast({
					title: '请先选择站点',
					icon: 'none',
					mask: 'true',
					duration: 1000
				})
				break;
		}
		return stationChoice
	},

	onStationConfirm() {
		console.log("点击的上车站点", this.data.getonStation[this.data.onSelected])
		var stationChoice = this.checkChoice(this.data.getonStation[this.data.onSelected])
		console.log("check上车站点", stationChoice)
		wx.request({
			url: 'http://localhost:8080/passenger/getonStationName?getonStationName=' + stationChoice,
			method: 'PUT',
			header: {
				'Authorization': app.globalData.userInfo.userInfo.token
			},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.code === 200) {
						console.log("后端信息", res.data)
						const newUserInfo = {
							getonStationName: stationChoice,
						}
						const userInfoPast = app.globalData.userInfo.userInfo
						const userInfo = {
							...userInfoPast,
							...newUserInfo
						}
						console.log("更新后的用户信息", userInfo)
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
						wx.showToast({
							icon: 'none',
							title: '选择成功！',
							mask: true,
							duration: 2000
						});
						setTimeout(() => {
							this.setData({
								showNoRoute: false,
								showOnContainer: false
							})
						}, 2000);
					}
				}
			},
			fail: (err) => {
				console.log("连接失败", err)
			}
		})
	},

	getonReselect() {
		this.setData({
			showNoRoute: false,
			showOnContainer: true
		})
		this.deleteOnStation()
	},

	deleteOnStation() {
		const {
			getonStationName,
			...rest
		} = app.globalData.userInfo.userInfo
		const userInfo = rest
		console.log("更新后的司机信息", userInfo)
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

	handleOffStationClick(e) {
		const index = e.currentTarget.dataset.index;
		this.setData({
			offSelected: index,
		});
	},

	offStationConfirm() {
		console.log("点击的下车站点", this.data.getoffStation[this.data.offSelected])
		var stationChoice = this.checkChoice(this.data.getoffStation[this.data.offSelected])
		console.log("check下车站点", stationChoice)
		wx.request({
			url: 'http://localhost:8080/passenger/getoffStationName?getoffStationName=' + stationChoice,
			method: 'PUT',
			header: {
				'Authorization': app.globalData.userInfo.userInfo.token
			},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.code === 200) {
						console.log("后端信息", res.data)
						const newUserInfo = {
							getoffStationName: stationChoice,
						}
						const userInfoPast = app.globalData.userInfo.userInfo
						const userInfo = {
							...userInfoPast,
							...newUserInfo
						}
						console.log("更新后的用户信息", userInfo)
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
						wx.showToast({
							icon: 'none',
							title: '选择成功！',
							mask: true,
							duration: 2000
						});
						setTimeout(() => {
							this.setData({
								showNoBus: false,
								showOffContainer: false
							})
						}, 2000);
					}
				}
			},
			fail: (err) => {
				console.log("连接失败", err)
			}
		})
	},

	getoffReselect() {
		this.setData({
			showNoBus: false,
			showOffContainer: true
		})
		this.deleteOffStation()
	},

	deleteOffStation() {
		const {
			getoffStationName,
			...rest
		} = app.globalData.userInfo.userInfo
		const userInfo = rest
		console.log("更新后的司机信息", userInfo)
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

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		console.log("站点页面onshow")
		if (app.globalData.userInfo.userInfo.number != null) {
			if (app.globalData.userInfo.userInfo.getonStationName != null) {
				this.setData({
					showNoRoute: false,
					showOnContainer: false
				})
			} else {
				this.getStation()
				this.setData({
					showNoRoute: false,
					showOnContainer: true
				})
			}
		} else {
			this.setData({
				showNoRoute: true,
				showOnContainer: false
			})
		}

		if (app.globalData.userInfo.userInfo.driverId != null) {
			if (app.globalData.userInfo.userInfo.getoffStationName != null) {
				this.setData({
					showNoBus: false,
					showOffContainer: false
				})
			} else {
				this.setData({
					showNoBus: false,
					showOffContainer: true
				})
			}
		} else {
			this.setData({
				showNoBus: true,
				showOffContainer: false
			})
		}
	},

	getStation() {
		let onStation, offStation
		switch (app.globalData.userInfo.userInfo.number) {
			case 1:
				onStation = ['长安校区乘车点', '长安校区东门']
				offStation = ['紫薇', '高新', '劳动南路', '友谊校区']
				break;
			case 2:
				onStation = ['长安校区乘车点', '长安校区东门']
				offStation = ['国际医学中心', '劳动南路', '友谊校区']
				break;
			case 3:
				onStation = ['友谊校区', '高新', '紫薇']
				offStation = ['长安校区东门', '云天苑', '教学西楼', '海天苑', '启翔楼']
				break;
			case 4:
				onStation = ['友谊校区', '国际医学中心']
				offStation = ['长安校区东门', '云天苑', '教学西楼', '海天苑', '启翔楼']
				break;
		}
		this.setData({
			getonStation: onStation,
			getoffStation: offStation
		})
		console.log(this.data.getoffStation)
		console.log(this.data.getonStation)
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