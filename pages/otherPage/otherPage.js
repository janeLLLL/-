//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    avatarUrl:'',
    nickName:'',
    ne:[],
    grids: [0, 1, 2, 3, 4, 5],
  },
  onLoad: function () {
    const db = wx.cloud.database({
      env: 'js-s5vgs'
    })
    db.collection('user')
      .where({
        look:true
      })
      .get({
        success: res => {
          console.log('?', res)
          wx.setStorageSync('all', res.data)
        }
      })

    db.collection('user')
    .where({
      look:true
    })
    .count({
      success: res => {
        console.log('?',res)
        wx.setStorageSync('sum', res.total)
      }
    })
    var random = (Math.floor(Math.random() * (wx.getStorageSync('sum')) + 1))-1;
    
    var othersId = wx.getStorageSync('all')
    console.log('??', othersId)
    wx.setStorageSync('otherOpenid', othersId[random]._openid)
    console.log('???', wx.getStorageSync('otherOpenid'))

    this.setData({
      avatarUrl: othersId[random].avatarUrl,
      nickName: othersId[random].nickName,
    })

    db.collection('text')
      .where({
        _openid: wx.getStorageSync('otherOpenid')
      })
      .get({
        success: res => {
          this.setData({
            ne: res.data,
          })
          console.log('ne',res.data)
        }
      })
  }

  
})
