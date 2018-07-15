var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

const app = getApp()

Page({
  data: {
    painting: {},
    shareImage: ''
  },

  onLoad: function (options) {
    this.eventDraw();
    
  },

  eventDraw() {
    var that = this;
    console.log("event drawing...");
    wx.showLoading({
      title: '绘制分享图片中',
      mask: true
    })

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
            url: '/images/pics/avatar.jpeg',
            top: 300,
            left: 29,
            width: 55,
            height: 55
          },
          {
            type: 'text',
            content: '情人',
            fontSize: 30,
            color: 'black',
            textAlign: 'left',
            top: 310,
            left: 100,
            bolder: true
          },
          {
            type: 'text',
            content: '你的头发美丽而哀愁，就想你的灵魂.你的头发美丽而哀愁，就想你的灵魂',
            fontSize: 19,
            color: 'black',
            textAlign: 'left',
            top: 365,
            left: 29,
            lineHeight: 28,
            breakWord: true,
            MaxLineNumber: 2,
            width: 250,
            bolder: true
          },
          {
            type: 'image',
            url: '/images/pics/ccyn_qrcode.png',
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
  }
})
