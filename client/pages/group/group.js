var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var globalSections = [];
var totalNum = 3;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    section: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("first section");
    this.getServerAnswers('13');
  },

  getServerAnswers: function (qid) {
    var that = this;

    wx.request({
      url: config.service.questionUrl,
      data: {
        qtype: 'sectionAnswers',
        qid: qid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("get section answers from server...");
        console.log(res.data);
        var sectionAnswers = res.data;
        that.transformAnswer(qid, sectionAnswers);
      }
    });
  },

  transformAnswer: function (qid, answers) {
    var question = null;
    var next_index = null;
    var button_value = null;
    var content_type = qid === '15'? 'name': 'other';
    console.log(`content_type: ${content_type}`);
    
    switch(qid) {
      case '13':
        question = "在这里记下一个日子，那天发生了什么？";
        next_index = '14';
        button_value = "下一页";
        break;
      case '14':
        question = "在这里记下一个地方，理由是什么？";
        next_index = '15';
        button_value = "下一页";
        break;
      case '15':
        question = "最后请记下一个名字，不为什么。";
        next_index = 'personal';
        button_value = "返回赠言页";
        break;
    }

    const section = {
      'question': question,
      'answers': answers,
      'next_index': next_index,
      'button_value': button_value,
      'content_type': content_type
    }
    var that = this;
    that.setData({ section: section });
  },

  goNextPage: function (e) {
    const next_index = e.currentTarget.dataset.value;
    if (next_index === 'personal') {
      wx.navigateTo({
        url: "/pages/personal/personal",
      });
    } else {
      this.getServerAnswers(next_index);
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})