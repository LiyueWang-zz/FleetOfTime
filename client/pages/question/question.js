// pages/question/question.js

var app = getApp();
var totalQuestionNum = 0;
var globalQuestions = null;
var globalAdvices = null;

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    question: null,

    section_answer: null,

    // 是否显示loading
    showLoading: false,

    // loading提示语
    loadingMessage: '正在加载中...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getServerData();

    if (!options.qIndex) {
      this.transform(0);
    }
  },

  transform(gIndex) {
    var question = globalQuestions[gIndex];
    const qindex = gIndex + 1;

    var choice_answer = 'A';
    var choice_answers = wx.getStorageSync('choice_answers');
    // console.log(`transform ${qindex} choice_answers: ` + JSON.stringify(choice_answers, null, 4));
    if (choice_answers && choice_answers[qindex]) {
      choice_answer = choice_answers[qindex];
    }

    var fill_answer = null;
    var fill_answers = wx.getStorageSync('fill_answers');
    // console.log(`transform ${qindex} fill_answers: ` + JSON.stringify(fill_answers, null, 4));
    if (fill_answers && fill_answers[qindex]) {
      fill_answer = fill_answers[qindex];
    }

    var section_answer = null;
    var section_answers = wx.getStorageSync('section_answers');
    // console.log(`transform ${qindex} section_answers: ` + JSON.stringify(section_answers, null, 4));
    if (section_answers && section_answers[qindex]) {
      section_answer = section_answers[qindex];
    }

    if (question.qtype === 'combination' || question.qtype === 'choice') {
      const options = question.choice_options.split(';');
      question.choices = [
        { name: 'A', value: options[0], checked: (choice_answer === 'A' ? true : false) },
        { name: 'B', value: options[1], checked: (choice_answer === 'B' ? true : false) },
        { name: 'C', value: options[2], checked: (choice_answer === 'C' ? true : false) },
        { name: 'D', value: options[3], checked: (choice_answer === 'D' ? true : false) }
      ];
    }

    if (question.qtype === 'combination' || question.qtype === 'fill') {
      var first = null;
      var second = null;

      const parts = question.fill_question.split('|');
      if (parts.length > 1) {
        question.first = parts[0];
        second = parts[1];
      } else {
        second = parts[0];
      }

      const fills = second.split(';');
      var qfills = []
      for (var i = 0; i < fills.length; i++) {
        const isTextKb = (qindex === 7) && (i === fills.length - 1);
        const parts = fills[i].split('?');
        const qfill = {
          prefix: parts[0],
          post: parts[1],
          answer: fill_answer ? fill_answer[i.toString()] : null,
          keyboard: isTextKb ? 'text': 'number' 
        }
        qfills.push(qfill);
      }
      question.fills = qfills;
    }

    // console.log("transformed question: " + JSON.stringify(question, null, 4));
    var that = this;
    that.setData({ question: question });
    that.setData({ section_answer: section_answer });   
  },

  /**
   * 获取questions及Advices列表:从服务端拉取
   */
  getServerData() {
    var that = this;
    app.getQuestionList(list => {
      console.log("getting questions.. " + list.length);
      totalQuestionNum = list.length;
      globalQuestions = list;
    });

    app.getServerAdvices(list => {
      console.log("getting advices.. " + list.length);
      globalAdvices = list;
    });
  },

  lastQuestion(e) {
    var gIndex = e.currentTarget.dataset.value;
    // console.log("last question get index: " + (gIndex));
    if (gIndex >= 0) {
      this.transform(gIndex);
    } else {
      // do nothing
    }
  },

  nextQuestion(e) {
    var gIndex = e.currentTarget.dataset.value;
    // console.log("next question get gloableQuestion index: " + (gIndex));

    if (gIndex < totalQuestionNum) {
      this.transform(gIndex);
    } else {
      console.log("完成问题");
      // 将本地缓存答案数据上传服务器
      this.uploadData();
      util.showSuccess('提交成功');
      // 跳转到结果页面
      wx.navigateTo({ 
        url: "/pages/personal/personal",
      });
    }
  },

  // store choice question answer
  radioChange: function (e) {
    var qindex = e.currentTarget.dataset.value;
    var checked = e.detail.value;
    // console.log('radio 单选题第' + qindex + '题，选' + checked);
    try {
      var value = wx.getStorageSync('choice_answers');
      if (value) {
        value[qindex] = checked;
      } else {
        value = {};
        value[qindex] = checked;
      }
      wx.setStorageSync('choice_answers', value);
    } catch (e) {
      console.error("get local storage of choice_answers failed!" + JSON.stringify(e, null, 4));
    }
  },
  
  // store fill question answer
  digitInputStore: function (e) {
    var indexes = e.currentTarget.dataset.value;
    const qindex = indexes.split(';')[0];
    const findex = indexes.split(';')[1];
    // convert to float except 7,2
    var answer = e.detail.value;
    if (qindex!=7 && findex!=2) {
      answer = parseFloat(e.detail.value);
    }
    try {
      var value = wx.getStorageSync('fill_answers');
      if (value) {
        if (value[qindex]) {
          value[qindex][findex] = answer;
        } else {
          value[qindex] = {};
          value[qindex][findex] = answer;
        }
      } else {
        value = {};
        value[qindex] = {};
        value[qindex][findex] = answer;
      }
      wx.setStorageSync('fill_answers', value);
      // console.log("get updated local fill_answers:" + JSON.stringify(wx.getStorageSync('fill_answers'), null, 4));
    } catch (e) {
      console.error("get local storage of fill_answers failed!" + JSON.stringify(e, null, 4));
    }
  },

  // store section question answer
  textInputStore: function (e) {
    const qindex = e.currentTarget.dataset.value;
    const answer = e.detail.value;
    try {
      var value = wx.getStorageSync('section_answers');
      if (value) {
        value[qindex] = answer;
      } else {
        value = {};
        value[qindex] = answer;
      }
      wx.setStorageSync('section_answers', value);
      // console.log("get updated local section_answers:" + JSON.stringify(wx.getStorageSync('section_answers'), null, 4));
    } catch (e) {
      console.error("get local storage of section_answers failed!" + JSON.stringify(e, null, 4));
    }
  },

  // 问卷结束，将所有结果上传至服务器
  uploadData() {
    console.log("uploading answers to server...");
    // upload answers
    const uid = wx.getStorageSync('uid');
    const choice_answers = wx.getStorageSync('choice_answers');
    const fill_answers = wx.getStorageSync('fill_answers');
    const section_answers = wx.getStorageSync('section_answers');
    // console.log("cache choice_answers: " + JSON.stringify(choice_answers, null, 4));
    // console.log("cache fill_answers: " + JSON.stringify(fill_answers, null, 4));
    // console.log("cache section_answers: " + JSON.stringify(section_answers, null, 4));

    for (var i = 0; i < totalQuestionNum; i++) {
      const question = globalQuestions[i];
      const qtype = question.qtype;
      var answer = {
        'uid': uid,
        'qid': i+1,
        'ans_type': qtype
      };
      
      if (qtype === 'combination') {
        if (choice_answers[question.qindex]) {
          answer['choice_answer'] = choice_answers[question.qindex];
        } else {
          answer['choice_answer'] = 'A';
        }

        if (fill_answers[question.qindex]) {
          var values = [];
          for (var key in fill_answers[question.qindex]) {
            values.push(fill_answers[question.qindex][key]);
          }
          answer['fill_answer'] = values.join(';');
          // answer['fill_answer'] = Object.values(fill_answers[question.qindex]).join(';');
        } else {
          answer['fill_answer'] = '';
        }
      } else if (qtype === 'choice') {
        if (choice_answers[question.qindex]) {
          answer['choice_answer'] = choice_answers[question.qindex];
        } else {
          answer['choice_answer'] = 'A';
        }
      } else if (qtype === 'fill') {
        if (fill_answers[question.qindex]) {
          var values = [];
          for (var key in fill_answers[question.qindex]) {
            values.push(fill_answers[question.qindex][key]);
          }
          answer['fill_answer'] = values.join(';');
          // answer['fill_answer'] = Object.values(fill_answers[question.qindex]).join(';');
        } else {
          answer['fill_answer'] = '';
        }
      } else if (qtype === 'section') {
        if (section_answers[question.qindex]) {
          answer['section_answer'] = section_answers[question.qindex];
        } else {
          answer['section_answer'] = '';
        }
      }

      // console.log(`answer for question ${question.qindex}: ` + JSON.stringify(answer, null, 4));
      this.putAnswer(answer);
    }
    // compute advice
    this.computeAdvice();
  },

  computeAdvice() {
    const uid = wx.getStorageSync('uid');
    const choice_answers = wx.getStorageSync('choice_answers');
    const fill_answers = wx.getStorageSync('fill_answers');
    var advice_scores = {};
    var max = 0;
    var max_tag = '';
    var max_advices = '';
    var default_tag = '';
    var default_advices = '';
    
    globalAdvices.forEach(advice => {
      const tag = advice.tag;
      switch(tag) {
        case '学霸':
          advice_scores['学霸'] = ((choice_answers['5'] === 'D') ? 50 : 0) +
            ((fill_answers && fill_answers['2']) ? ((fill_answers['2']['2'] > 30) ? 20 : 0): 0) + 
            ((fill_answers && fill_answers['3']) ? ((fill_answers['3']['0'] > 30) ? 20 : 0) + ((fill_answers['3']['1'] > 20) ? 60 : 0) : 0);
          break;
        case '死宅':
          advice_scores['死宅'] = ((fill_answers && fill_answers['2']) ? ((fill_answers['2']['1'] > 70) ? 60 : 0) : 0) +
            ((fill_answers && fill_answers['6']) ? ((fill_answers['6']['4'] > 70) ? 50 : 0) : 0);
          default_tag = tag;
          default_advices = advice.advices;
          break;
        case '文青':
          advice_scores['文青'] = ((fill_answers && fill_answers['1']) ? ((fill_answers['1']['1'] > 10) ? 50 : 0) : 0)+
            ((fill_answers && fill_answers['5']) ? ((fill_answers['5']['1'] > 10) ? 50 : 0) + ((fill_answers['5']['2'] > 5) ? 60 : 0) : 0);
          break;
        case '交际花':
          advice_scores['交际花'] = ((choice_answers['4'] === 'D') ? 50 : 0) +
            ((choice_answers['9'] === 'D') ? 20 : 0) +
            ((choice_answers['11'] === 'D') ? 30 : 0) +
            ((fill_answers && fill_answers['2']) ? ((fill_answers['2']['3'] > 30) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['4']) ? ((fill_answers['4']['2'] > 10) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['6']) ? ((fill_answers['6']['3'] > 20) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['7']) ? ((fill_answers['7']['1'] > 3) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['9']) ? ((fill_answers['9']['1'] > 10) ? 50 : 0) : 0);
          break;
        case '社会':
          advice_scores['社会'] = ((choice_answers['4'] === 'D') ? 50 : 0) +
            ((fill_answers && fill_answers['7']) ? ((fill_answers['7']['1'] > 6) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['8']) ? ((fill_answers['8']['2'] > 3) ? 50 : 0) : 0) +
            ((fill_answers && fill_answers['9']) ? ((fill_answers['9']['0'] > 20) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['11']) ? ((fill_answers['11']['4'] > 10) ? 30 : 0) : 0) +
            ((fill_answers && fill_answers['12']) ? ((fill_answers['12']['1'] > 10) ? 80 : 0) : 0);
          break;
        case '浪子':
          advice_scores['浪子'] = ((choice_answers['1'] === 'D') ? 80 : 0);
          break;
        case '吃货':
          advice_scores['吃货'] = ((fill_answers && fill_answers['6']) ? ((fill_answers['6']['2'] > 20) ? 60 : 0) + ((fill_answers['6']['6'] > 20) ? 60 : 0) : 0);
          break;
        case '败家子':
          advice_scores['败家子'] = ((choice_answers['12'] === 'D') ? 50 : 0) +
            ((fill_answers && fill_answers['12']) ? ((fill_answers['12']['0'] > 5000) ? 80 : 0) : 0);
          break;
        case '养生':
          advice_scores['养生'] = ((choice_answers['10'] === 'A') ? 80 : 0) +
            ((fill_answers && fill_answers['6']) ? ((fill_answers['6']['5'] > 20) ? 50 : 0) : 0);
          break;
        case '有情人':
          advice_scores['有情人'] = ((fill_answers && fill_answers['1']) ? ((fill_answers['1']['2'] > 2) ? 60 : 0) : 0) +
            ((fill_answers && fill_answers['4']) ? ((fill_answers['4']['0'] > 5) ? 60 : 0) + ((fill_answers['4']['1'] > 2) ? 60 : 0) : 0) +
            ((fill_answers && fill_answers['11']) ? ((fill_answers['11']['0'] > 30) ? 60 : 0) : 0);
          break;
        default:
          console.log("Unexpected tag: "+tag);
          break;
      }

      if (advice_scores[tag] > max) {
        max = advice_scores[tag];
        max_tag = tag;
        max_advices = advice.advices;
      }
    });
    // console.log("advice_scores: " + JSON.stringify(advice_scores, null, 4));
    if (max==0) {
      max_tag = default_tag;
      max_advices = default_advices;
    }

    max_advices = max_advices.split('\n');
    const index = util.getRandomInt(max_advices.length);
    const selected_advice = max_advices[index];
    // console.log(`max_tag: ${max_tag}, max_score: ${max}, selected_advice: ${selected_advice}`);
    wx.setStorageSync('tag', max_tag);
    wx.setStorageSync('advice', selected_advice);

    this.updateUserAdvice(uid, advice_scores, max_tag, selected_advice);
  },

  updateUserAdvice: function (uid, tag_scores, tag, advice) {
    console.log("updateUserAdvice into server...");
    var that = this;

    wx.request({
      url: config.service.questionUrl,
      data: {
        qtype: 'updateUserAdvice',
        uid: uid,
        tag_scores: JSON.stringify(tag_scores),
        tag: tag,
        advice: advice
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: 'POST',
      success: function (res) {
        console.log("updateUserAdvice result: " + JSON.stringify(res.data, null, 4));
      }
    });
  },

  putAnswer(answer) {
    // console.log("put answer into server...");
    var that = this;

    wx.request({
      url: config.service.questionUrl,
      data: {
        qtype: 'putAnswer',
        answer: answer
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: 'POST',
      success: function (res) {
        console.log("put answer result: " + JSON.stringify(res.data, null, 4));
      }
    });
  },

  //Useless: 
  getAnswer(uid, qid) {
    console.log(`get answer from server for uid=${uid}, qid=${qid}...`);
    var that = this;

    return wx.request({
      url: config.service.questionUrl,
      data: {
        qtype: 'getAnswer',
        uid: uid,
        qid: qid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("get answer result: " + JSON.stringify(res.data, null, 4));
        if(res.data && res.data.length >=1) {
          wx.setStorageSync('temp_answer', res.data[0]);
        }
      }
    });
  },

  //Useless: 上传一题答案
  uploadSingleAnswer(qindex) {
    const currentGindex = qindex - 1;  //GlobleQuestion index
    const qtype = globalQuestions[currentGindex].qtype;
    const uid = wx.getStorageSync('uid');
    var answer = {
      'uid': uid,
      'qid': globalQuestions[currentGindex].id,
      'ans_type': qtype
    };

    if (qtype === 'combination') {
      answer['choice_answer'] = wx.getStorageSync('choice_answer');
      answer['fill_answer'] = Object.values(wx.getStorageSync('fill_answer')).join(';');
    } else if (qtype === 'choice') {
      answer['choice_answer'] = wx.getStorageSync('choice_answer');
    } else if (qtype === 'fill') {
      answer['fill_answer'] = Object.values(wx.getStorageSync('fill_answer')).join(';');
    } else if (qtype === 'section') {
      answer['section_answer'] = wx.getStorageSync('section_answer');
    }

    console.log(`answer for question ${qindex}: ` + JSON.stringify(answer, null, 4));
    this.putAnswer(answer);

    // clean cache answers
    console.log("cleaning cache answers...");
    wx.setStorageSync('choice_answer', 'A');
    wx.setStorageSync('fill_answer', {});
    wx.setStorageSync('section_answer', "");
  },

  //Useless
  initialCachedAnswers() {
    const choice_answers = {
      "1": "A",
      "4": "A",
      "5": "A",
      "9": "A",
      "10": "A",
      "11": "A",
      "12": "A"
    };
    wx.setStorageSync('choice_answers', choice_answers);

    const fill_answers = {
      "1": {
        "0": 0,
        "1": 0,
        "2": 0,
      },
      "2": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
      },
      "3": {
        "0": 0,
        "1": 0,
        "2": 0,
      },
      "4": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
      },
      "5": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
      },
      "6": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
      },
      "7": {
        "0": 0,
        "1": 0,
        "2": 0,
      },
      "8": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
      },
      "9": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
      },
      "11": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
      },
      "12": {
        "0": 0,
        "1": 0,
      }
    };
    wx.setStorageSync('fill_answers', fill_answers);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload");
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