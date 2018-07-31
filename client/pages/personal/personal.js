var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tag: null,
    advice: null,

    painting: {},
    shareImage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const tag = wx.getStorageSync('tag');
    const advice = wx.getStorageSync('advice');
    if (tag&&advice) {
      var that = this;
      that.setData({ tag: tag });
      that.setData({ advice: advice });
    } else {
      this.getServerAdvice();
    }
  },

  getServerAdvice: function() {
    var that = this;
    const uid = wx.getStorageSync('uid');

    wx.request({
      url: config.service.questionUrl,
      data: {
        qtype: 'userAdvice',
        uid: uid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log("get advice for user from server...");
        var user = res.data[0];
        that.setData({ tag: user.tag });
        that.setData({ advice: user.advice });

        // that.startCanvas();
      }
    });
  },

  // 跳转到总体统计结果页面
  goGroupPage: function(e) {
    wx.navigateTo({
      url: "/pages/group/group",
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '葱葱一念',
      path: '/page/personal/personal',
      success(e) {
        // shareAppMessage: ok,
        // shareTickets 数组，每一项是一个 shareTicket ，对应一个转发对象
        // 需要在页面onLoad()事件中实现接口
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true
        });
      },
      fail(e) {
        // shareAppMessage:fail cancel
        // shareAppMessage:fail(detail message) 
      },
      complete() { }
    }
  },

  // canvas by component
  // 生成分享图片
  goCanvasPage: function (e) {
    var that = this;
    that.eventDraw();
  },

  eventDraw() {
    var that = this;
    console.log("event drawing...");
    wx.showLoading({
      title: '生成分享图片中',
      mask: true
    })

    const avatarUrl = wx.getStorageSync('avatarUrl');
    that.setData({
      painting: {
        width: 375,
        height: 555,
        views: [
          {
            type: 'image',
            url: '/images/pics/adviceBackgroud3.jpg',
            top: 0,
            left: 0,
            width: 375,
            height: 555
          },
          {
            type: 'image',
            url: avatarUrl,
            top: 300,
            left: 20,
            width: 50,
            height: 50
          },
          {
            type: 'text',
            content: that.data.tag,
            fontSize: 26,
            color: 'black',
            textAlign: 'left',
            top: 312,
            left: 90,
            bolder: true
          },
          {
            type: 'text',
            content: that.data.advice,
            fontSize: 17,
            color: 'black',
            textAlign: 'left',
            top: 365,
            left: 20,
            lineHeight: 28,
            breakWord: true,
            MaxLineNumber: 3,
            width: 300,
            bolder: false
          },
          {
            type: 'image',
            url: '/images/pics/ccyn_qrcode.jpg',
            top: 455,
            left: 290,
            width: 70,
            height: 70
          },
          {
            type: 'text',
            content: '洋葱调查局出品',
            fontSize: 14,
            color: 'purple',
            textAlign: 'left',
            top: 530,
            left: 275,
            bolder: true
          }
        ]
      }
    })
  },

  eventSave() {
    var that = this;
    console.log("event saving...");
    wx.saveImageToPhotosAlbum({
      filePath: that.data.shareImage,
      success(res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  eventGetImage(event) {
    var that = this;
    console.log("eventGetImage...");
    wx.hideLoading()
    const { tempFilePath } = event.detail
    that.setData({
      shareImage: tempFilePath
    })
    this.eventSave();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})