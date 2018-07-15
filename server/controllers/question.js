const { mysql } = require('../qcloud')

/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get(ctx, next) {
  console.log("question getting...");
  console.log("ctx.query: " + JSON.stringify(ctx.query, null, 4));
  // ctx.state.data = { msg: 'Hello World' };

  const qtype = ctx.query.qtype;
  if (qtype === 'questions') {
    const questions = await mysql('ccyn').select('*').from('question');
    ctx.body = questions;
    ctx.state.data = { questions: questions};
  }
  else if (qtype === 'user') {
    const nickName = ctx.query.nickName;
    const user = await mysql('ccyn').select('*').from('user').where('nick_name', nickName);
    ctx.body = user;
    // ctx.state.data = { user: user };
  }
  else if (qtype === 'userAdvice') {
    const uid = ctx.query.uid;
    const user = await mysql('ccyn').select('*').from('user').where('id', uid);
    ctx.body = user;
    // ctx.state.data = { user: user };
  }
  else if (qtype === 'advice') {
    const aid = ctx.query.id;
    const advice = await mysql('ccyn').select('*').from('advice').where('id', aid);
    ctx.body = advice;
    // ctx.state.data = { user: user };
  }
  else if (qtype === 'advices') {
    const aid = ctx.query.id;
    const advices = await mysql('ccyn').select('*').from('advice');
    ctx.body = advices;
    // ctx.state.data = { user: user };
  }
  else if (qtype === 'sectionAnswers') {
    const qid = ctx.query.qid;
    const answers = await mysql('ccyn').select('section_answer').from('answer').whereNot('section_answer', '').andWhere('qid', qid);
    ctx.body = answers;
  }
  else if (qtype === 'getAnswer') {
    const uid = ctx.query.uid;
    const qid = ctx.query.qid;
    const answers = await mysql('ccyn').select('*').from('answer').where('qid', qid).andWhere('uid', uid);
    ctx.body = answers;
  }
  else {
    ctx.body = 'ERR_WHEN_GET_QUESTION';
  }
  
}

async function post(ctx, next) {
  console.log("question posting...");
  const body = ctx.request.body;
  const qtype = body.qtype;

  if (qtype === 'putUser') {
    const userInfo = body.userInfo;
    const user = {
      "nick_name": userInfo.nickName,
      "gender": userInfo.gender,
      "city": userInfo.city,
      "province": userInfo.province,
      "country": userInfo.country
    }
    const res = await mysql('user').insert(user);
    // res: [{0: 1, length:1}]
    ctx.body = res;
  } else if (qtype === 'updateUserMajor') {
    const uid = body.uid;
    const updates = {
      major: body.major,
      grade: body.grade
    }
    const res = await mysql('user').update(updates).where('id', uid);
    ctx.body = res;

  } else if (qtype === 'updateUserAdvice') {
    const uid = body.uid;
    const updates = {
      tag_scores: body.tag_scores,
      tag: body.tag,
      advice: body.advice,
      status: true
    }
    const res = await mysql('user').update(updates).where('id', uid);
    ctx.body = res;

  } else if (qtype === 'putAnswer') {
    const data = body.answer;
    const answer = {
      "uid": data.uid,
      "qid": data.qid,
      "ans_type": data.ans_type,
      "choice_answer": data.choice_answer,
      "fill_answer": data.fill_answer,
      "section_answer": data.section_answer
    }
    // const res = await mysql('ccyn').insert(answer).into('answer');
    // const res = await mysql.raw(mysql('answer').insert(answer).toQuery() + ' ON DUPLICATE KEY UPDATE ' + 
    //                   mysql.raw('choice_answer= ?, fill_answer= ?, section_answer= ?', [data.choice_answer, data.fill_answer, data.section_answer]));

    const res = await mysql('answer')
      .where({ 'uid': data.uid, 'qid': data.qid })
      .update({
        "choice_answer": data.choice_answer,
        "fill_answer": data.fill_answer,
        "section_answer": data.section_answer
      })
      .catch(err => console.log(err))
      || await mysql('answer')
      .insert(answer);

    ctx.body = res;
  } else {
    ctx.body = 'ERR_WHEN_POST_QUESTION';
  }
}

module.exports = {
  post,
  get
}
