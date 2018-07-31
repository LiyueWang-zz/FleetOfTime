//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        logged: false,
        userStatus: 0,
        takeSession: false,
        requestResult: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    //Deprecate: 用户直接登录
    login: function() {
        if (this.data.logged) return

        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
              console.log("qcloud.login result: " + JSON.stringify(result, null, 4));
                if (result) {
                    util.showSuccess('登录成功');
                    that.setData({
                        userInfo: result,
                        logged: true
                    });
                    // check if user in user table
                    that.checkUser(result);
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            console.log("userInfo: " + JSON.stringify(result.data.data));
                            that.setData({
                                userInfo: result.data.data,
                                logged: true
                            });

                            // check if user in user table
                            that.checkUser(result.data.data);
                        },

                        fail(error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },

    // 按钮组件用户登录
    bindGetUserInfo: function () {
      if (this.data.logged) return

      util.showBusy('正在登录')
      const session = qcloud.Session.get()

      if (session) {
        // 第二次登录
        // 或者本地已经有登录态
        // 可使用本函数更新登录态
        qcloud.loginWithCode({
          success: res => {
            // console.log("using existing session login...");
            this.setData({ userInfo: res, logged: true });
            util.showSuccess('登录成功');
            this.checkUser(res);
          },
          fail: err => {
            console.error(err)
            util.showModel('登录错误', err.message)
          }
        })
      } else {
        // 首次登录
        qcloud.login({
          success: res => {
            // console.log("first login...");
            this.setData({ userInfo: res, logged: true });
            util.showSuccess('登录成功');
            this.checkUser(res);
          },
          fail: err => {
            console.error(err)
            util.showModel('登录错误', err.message)
          }
        })
      }
    },

    checkUser: function (userInfo) {
      var that = this;

      wx.request({
        url: config.service.questionUrl,
        data: {
          qtype: 'user',
          nickName: userInfo.nickName
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          // console.log("get user from server...");
          if (res.data.length === 0) {
            // console.log(`user ${userInfo.nickName} does not exist`);
            that.putUser(userInfo);
          } else {
            // console.log(`user ${userInfo.nickName} exists`);
            // set local cache uid
            const uid = res.data[0].id;
            const userStatus = res.data[0].status;
            const avatarUrl = userInfo.avatarUrl;
            const nickName = userInfo.nickName;
            // console.log(`cache uid: ${uid}, userStatus: ${userStatus}, avatarUrl: ${avatarUrl}, nickName: ${nickName}`);
            wx.setStorageSync('uid', uid);
            wx.setStorageSync('userStatus', userStatus);
            wx.setStorageSync('avatarUrl', avatarUrl);
            wx.setStorageSync('nickName', nickName);
            that.setData({
              userStatus: userStatus  
            });
          }
        }
      });
    },

    putUser: function (userInfo) {
      var that = this;

      wx.request({
        url: config.service.questionUrl,
        data: {
          qtype: 'putUser',
          userInfo: userInfo
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        success: function (res) {
          console.log("put user into server...");
          console.log("put user result: " + JSON.stringify(res.data, null, 4));
          // set local cache uid
          const uid = res.data[0];
          console.log(`store uid: ${uid}`);
          wx.setStorageSync('uid', uid);
          wx.setStorageSync('userStatus', 0);
        }
      });
    },

    nextPage: function(e) {
      const userStatus = wx.getStorageSync('userStatus');
      // 用户提交过问卷
      if (!userStatus) {
        // 跳转到结果页面
        wx.navigateTo({
          url: "/pages/question/question",
        });
      } else {
        // 跳转到结果页面
        wx.navigateTo({
          url: "/pages/personal/personal",
        });
      }
    },

    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    doRequest: function () {
        util.showBusy('请求中...')
        var that = this
        var options = {
            url: config.service.requestUrl,
            login: true,
            success (result) {
                util.showSuccess('请求成功完成')
                console.log('request success', result)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        }
        if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
            qcloud.request(options)
        } else {    // 使用 wx.request 则不带登录态
            wx.request(options)
        }
    },
})
