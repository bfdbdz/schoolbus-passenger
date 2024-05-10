// pages/location/location.js
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		latitude: 0,
		longitude: 0,
		speed: 0,
		markers: [],
		currentTime: '',
		fromRoute: null
	},

	/**
 * 生命周期函数--监听页面加载
 */
	onLoad(options) {
	this.createLocationTimer() //页面加载时创建定时器
	},

		//创建定时器
		createLocationTimer() {
			this.getLocationAndSpeed()
			this.timer = setInterval(() => {
				this.getLocationAndSpeed()
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
			if (permission == 1){
			wx.getLocation({
			type: 'gcj02', // 返回可以用于 wx.openLocation 的坐标
			success: (res) => {
				console.log("获取位置", res)
				this.setData({
					latitude: res.latitude,
					longitude: res.longitude,
					speed: res.speed,
					markers: [{
						id: 0,
						latitude: res.latitude,
						longitude: res.longitude,
						width: 20,
						height: 30
					}]
				})
				console.log("纬度", this.data.latitude)
				console.log("经度", this.data.longitude)
				console.log("速度", this.data.speed)
				console.log("markers", this.data.markers)
				this.moveMapToCenter()
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

	// 将定位在页面中心展示
	moveMapToCenter() {
		this.mapContext = wx.createMapContext('myMap')
		this.mapContext.moveToLocation()
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