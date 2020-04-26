var util = require('../../utils/util.js')
//index.js
//获取应用实例 
const app = getApp()

Page({
  data: {
    textarea: '',
    userInput: '',
    testtrue: true,
    sum: 0,
    cloudID: '',
    ne: [],
    hideNe: [],
    openid: '',
    viewBg: '',
    typeT: false,
    showT: false,
    showF: true,
    newOne: false,
    swiperH: [],
    iconT: 0,
    iconL: 0,

    grids: [0, 1, 2, 3, 4, 5],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    //幻灯片
    currentIndex: 0,
    look: false,

    shareData: {
      title: '-',
      desc: '负',
      path: '/pages/index/index'
    }
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function () {
    //初始化修改判断
    wx.setStorageSync('isUpdate', false);
    wx.setStorageSync('updateText', '');

    //每次登录都要删除数据库六天以前的所有数据
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回 
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    const db = wx.cloud.database({
      env: 'js-s5vgs'
    })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
        console.log("112", res.result)
        wx.setStorageSync('openid', getApp().globalData.openid)
        this.setData({
          openid: getApp().globalData.openid,
        })
      }
    })
    var that = this
    //检索数据库里是否有用户记录
    db.collection('user').where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: function (res) {
        if (res.data.length === 0) {
          db.collection('user').add({
            data: {
              look: false,
              avatarUrl: wx.getStorageSync("avatarUrl"),
              nickName: wx.getStorageSync("nickName"),
            },
            success: res => {
              wx.getImageInfo({
                src: 'userInfo.avatarUrl',
                success: function (res) {
                  wx.saveImageToPhotosAlbum({
                    filePath: 'res.path',
                  })
                }
              })
              //如果没有当前用户，存入数据
              that.setData({
                typeT: true
              })
              console.log('成功')
            }
          })
        } else {
          //取用户数据
          that.setData({
            look: res.data[0].look
          })
        }
      }
    })
    //无用户，且显示说明弹窗
    if (wx.getStorageSync('total') === 0) {

    }

    db.collection('text')
      .where({
        _openid: wx.getStorageSync('openid')
      })
      .get({
        success: res => {
          //处理文本数组
          wx.setStorageSync('noForgetText', res.data);
          var textEle = []
          var time = new Date()
          for (var i = 0; i < res.data.length; i++) {
            var x = time - res.data[i].createTime
            var day = parseInt(x / (1000 * 60 * 60 * 24))
            if (day < 7) {
              textEle.push(res.data[i])
            }
          }
          this.setData({
            ne: textEle
          })
        }
      })


    //初始化用户当天是否发过记录
    wx.setStorageSync('isDate', "0");
    //一些标记
    wx.setStorageSync('isUpdateY', false);

    //获取用户记录条数和是否授权世界之大
    db.collection('text').where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: function (res) {
        wx.setStorageSync('length', res.length);
      }
    })

    //加载格子样式
    setTimeout(() => {
      var query = wx.createSelectorQuery();
      //选择id
      var that = this;
      var swiperHeight = ''
      var percent = 750 / wx.getSystemInfoSync().windowWidth;
      console.log("比例", percent)
      query.select('.swiperH').boundingClientRect(function (rect) {
        swiperHeight = rect.height * percent
        wx.setStorageSync("swiperH", swiperHeight)
      })
      console.log("swiper长度", wx.getStorageSync("swiperH"))
      // query.select('.iconS').boundingClientRect(function (rect) {
      //   var iconHeight = rect.height * percent
      //   wx.setStorageSync("iconHeight", iconHeight)
      // })
      // console.log("icon长度", wx.getStorageSync("iconHeight"))
      query.select('.weui-grid__label').boundingClientRect(function (rect) {
        var height = rect.height * percent
        console.log("文字长度", height)
        that.setData({
          swiperH: height + 'rpx'
        })
      }).exec();
    }, 500)


  },
  //页面显示
  onShow: function () { },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //自创弹窗
  onReady: function () {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
    this.whatever = this.selectComponent("#whatever");
    this.isDelete = this.selectComponent("#isDelete");
  },
  //隐藏记录
  hiddenT() {
    this.popup.showPopup2();
  },
  //添加记录
  showPopup() {
    this.popup.showPopup();
  },
  //修改文字
  showPopupUpdate() {
    this.popup.showPopup1();
  },
  showPopup1() {
    this.whatever.showPopup1();
  },

  //取消事件
  _error() {
    console.log('你点击了取消');
    this.popup.hidePopup();
  },
  //确认事件
  _success() {
    console.log('你点击了确定');
    this.popup.hidePopup();
  },

  /**用户隐私弹窗 */
  _error1() {
    console.log('你点击了取消');
    this.whatever.hidePopup1();
  },

  _success1() {
    console.log('你点击了确定');
    this.whatever.hidePopup1();
  },

  //删除确认弹窗
  showPopup2() {
    this.isDelete.showPopup2();
  },
  _error2() {
    console.log('你点击了取消');
    this.isDelete.hidePopup2();
  },
  _success2() {
    console.log('你点击了确定');
    this.isDelete.hidePopup2();
  },

  //弹出菜单
  actionSheetTap: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text
    console.log(text)
    if (text === undefined) {
      wx.showActionSheet({
        itemList: ['填入记忆'],
        success(e) {
          if (e.tapIndex === 0) {
            that.showPopup()
          }
        }
      });
    } else {
      //检查数据库中的forget
      const db = wx.cloud.database({
        env: 'js-s5vgs'
      })
      db.collection('text')
        .where({
          area: text
        }).get({
          success: res => {
            wx.setStorageSync('forget', res.data[0].forget);
            wx.setStorageSync('deleteId', res.data[0]._id);
          }
        })

      wx.showActionSheet({
        itemList: ['填入记忆', '修改记忆', '删除记忆'],
        success(e) {
          if (e.tapIndex === 2) {
            //删除数据库记录
            that.showPopup2()
          } else if (e.tapIndex === 0) {
            //增加记忆
            that.showPopup()
          } else {
            //修改记忆
            wx.setStorageSync('isUpdate', true);
            wx.setStorageSync('updateText', text);
            that.showPopupUpdate()
          }
        }
      })
    }
  },
  //修改图标
  upDataText: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text;
    wx.setStorageSync('isUpdate', true);
    wx.setStorageSync('updateText', text);
    that.showPopupUpdate()
  },
  upDataText1: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text;
    console.log(text)
    wx.setStorageSync('isUpdateY', true);
    wx.setStorageSync('updateYin', text);
    that.showPopupUpdate()
  },
  //删除图标
  isDelete2: function (e) {
    console.log("sf")
    var text = e.currentTarget.dataset.text
    const db = wx.cloud.database({
      env: 'js-s5vgs'
    })
    db.collection('text')
      .where({
        area: text
      }).get({
        success: res => {
          wx.setStorageSync('forget', res.data[0].forget);
          wx.setStorageSync('deleteId', res.data[0]._id);
        }
      })
    this.showPopup2()
  },
  isDelete1: function (e) {
    var text = e.currentTarget.dataset.text
    wx.setStorageSync("deleteYin", true)
    const db = wx.cloud.database({
      env: 'js-s5vgs'
    })
    db.collection('text')
      .where({
        hiddenText: text
      }).get({
        success: res => {
          wx.setStorageSync('deleteId', res.data[0]._id);
        }
      })
    this.showPopup2()
  },
  redirectsTap() {
    const pages = getCurrentPages()
    const perpage = pages[pages.length - 1]
    perpage.onLoad()
    wx.navigateTo({
      url: '../forget/forget'
    })
  },
  explainT: function () {
    this.setData({
      showT: false,
    })
  },
  hiddenThis: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text;
    wx.setStorageSync('isUpdate', true);
    wx.setStorageSync('updateText', text);
    this.hiddenT()
  },

  //对隐藏内容操作
  actionSheetTap1: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text
    //检查数据库中的forget
    const db = wx.cloud.database({
      env: 'js-s5vgs'
    })
    db.collection('text')
      .where({
        area: text
      }).get({
        success: res => {
          wx.setStorageSync('forget', res.data[0].forget);
          wx.setStorageSync('deleteId', res.data[0]._id);
        }
      })

    wx.showActionSheet({
      itemList: ['修改伪装', '删除伪装'],
      success(e) {
        if (e.tapIndex === 1) {
          //删除数据库记录
          that.showPopup2()
        } else {
          //修改记忆
          wx.setStorageSync('isUpdateY', true);
          wx.setStorageSync('updateYin', text);
          that.showPopupUpdate()
        }
      }
    })
  },
  changeDot1() {
    this.setData({
      currentIndex: 1
    })
    const pages = getCurrentPages()
    const perpage = pages[pages.length - 1]
    perpage.onLoad()
  },
  changeDot2() {
    this.setData({
      currentIndex: 0
    })

  },

  bindchange: function (e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  onShareAppMessage() {
    return this.data.shareData
  },
})