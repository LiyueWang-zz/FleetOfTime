//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function () {
        qcloud.setLoginUrl(config.service.loginUrl);
        this.getQuestionList();
        this.getServerAdvices();
    },

    // 获取全部问题列表
    getQuestionList(cb) {
      var that = this;

      if (this.globalData.questionList) {
        typeof cb == 'function' && cb(this.globalData.questionList);
      } else {
        let list = [];

        // this.getLocalQuestions(storage => {
        //   // 本地缓存数据
        //   for (var k in storage) {
        //     list.push(storage[k]);
        //   }
        // });

        // 服务器数据
        this.getServerQuestions(data => {
          // console.log("data.len = " + JSON.stringify(data, null, 4));
          for (var k in data) {
            list.push(data[k]);
          }
        })
        that.globalData.questionList = list;
        console.log("that.globalData.questionList: " + that.globalData.questionList.length);
        typeof cb == 'function' && cb(that.globalData.questionList)
      }
    },

    // 获取服务器数据
    getServerQuestions(cb) {
      var that = this;

      wx.request({
        url: config.service.questionUrl, 
        data: {
          qtype: 'questions'
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log("get questions from server...");
          that.globalData.questionList = res.data;
          typeof cb == 'function' && cb(that.globalData.questionList)
        }
      });
    },

    // 获取服务器数据
    getServerAdvices(cb) {
      var that = this;
      console.log("in getServerAdvices");
      wx.request({
        url: config.service.questionUrl,
        data: {
          qtype: 'advices'
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log("get advices from server...");
          that.globalData.advices = res.data;
          typeof cb == 'function' && cb(that.globalData.advices)
        }
      });
    },

    // 获取本地问题缓存
    getLocalQuestions(cb) {
      var that = this;

      if (this.globalData.localQuestions) {
        typeof cb == 'function' && cb(this.globalData.localQuestions);
      } else {
        wx.getStorage({
          key: config.storage.questionListKey,
          success: (res) => {
            that.globalData.localQuestions = res.data;
            typeof cb == 'function' && cb(that.globalData.localQuestions);
          },
          fail: (error) => {
            that.globalData.localQuestions = {};
            typeof cb == 'function' && cb(that.globalData.localQuestions);
          }
        });
      }
    },

    globalData: {
      userInfo: null,

      questionList: null,

      advices: null,
    }
})