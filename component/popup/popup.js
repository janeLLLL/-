// component/popup.js
var util = require('../../utils/util.js')
Component({

  onshow: function() {},

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 弹窗内容
    content: {
      type: String,
      value: '内容'
    },
    // 弹窗取消按钮文字
    btn_no: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    btn_ok: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
    sum: 0,
    textTips: '“所有的一切都将消亡，一如泪水，消失在雨中。”——《银翼杀手》',
    userInput: '',
    updatePanelAnimationData: '',
    color: '',
    typeT: false,
    showT: false,
    showF: false,
    showW: false,
    showZ: false,
    titleTips: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hidePopup: function() {
      this._showOrCloseDialog("close")
      this.setData({
        typeT: false,
        showT: false,
        showF: false,
        showW: false,
        showZ: false,
        titleTips: '',
      })
      wx.setStorageSync('hiddenText', false)
      wx.setStorageSync('isUpdate', false)
      wx.setStorageSync('isUpdateY', false)
    },
    //展示弹框
    showPopup() {
      this._showOrCloseDialog("open")
      this.setData({
        title: '填入记忆',
        textTips: '“所有的一切都将消亡，一如泪水，消失在雨中。”——《银翼杀手》',
      })
    },
    //编辑
    showPopup1() {
      this._showOrCloseDialog("open")
      if (wx.getStorageSync("isUpdateY") === true) {
        this.setData({
          userInput: wx.getStorageSync('updateYin'),
          sum: wx.getStorageSync('updateYin').length,
          title: '编辑伪装'
        })
      } else {
        this.setData({
          userInput: wx.getStorageSync('updateText'),
          sum: wx.getStorageSync('updateText').length,
          title: '编辑记忆'
        })
      }
    },
    //隐藏
    showPopup2() {
      var updateText = wx.getStorageSync('updateText')
      wx.setStorageSync('hiddenText', true)
      wx.setStorageSync('isUpdate', false)
      this._showOrCloseDialog("open")
      this.setData({
        textTips: updateText,
        title: '填入伪装'
      })
    },
    /*
     * 内部私有方法建议以下划线开头
     * triggerEvent 用于触发事件
     */
    _error() {
      if (wx.getStorageSync('isUpdate') === true) {
        wx.setStorageSync('isUpdate', false)
        this.setData({
          userInput: '',
          sum: 0,
        })
      }
      if (wx.getStorageSync('hiddenText') === true) {
        wx.setStorageSync('hiddenText', false)
      }
      this.setData({
        typeT: false,
        showT: false,
        showF: false,
        showW: false,
        showZ: false,
        titleTips: '',
      })
      //触发取消回调
      this.triggerEvent("error")
    },
    _successClick() {
      if (this.data.sum === 0) {
        wx.showToast({
          title: '内容不能为空，请重新输入！',
          icon: 'none',
          duration: 2000 //持续的时间
        })
      } else {
        this._success()
      }
    },
    _success() {
      var time = new Date();
      // 再通过setData更改Page()里面的data，动态更新页面的数据
      const db = wx.cloud.database()
      var updateId = ''
      var hiddenId = ''
      console.log("dfbuwdfds")
      if (wx.getStorageSync('isUpdate') === true) {
        console.log("1")
        /**修改记录 */
        db.collection('text')
          .where({
            area: wx.getStorageSync('updateText')
          }).get({
            success: res => {
              updateId = res.data[0]._id
              db.collection('text')
                .doc(updateId)
                .update({
                  data: {
                    area: this.userInput,
                    motifyTime: time,
                  }
                })
              const pages = getCurrentPages()
              const perpage = pages[pages.length - 1]
              perpage.onLoad()
              this.setData({
                userInput: '',
                sum: 0,
              })
              wx.setStorageSync('isUpdate', false)
              //刷新功能不灵
              wx.showToast({
                title: '修改成功',
                icon: 'none',
                duration: 2000 //持续的时间
              })
            }
          })
        //隐藏记录
      } else if (wx.getStorageSync("isUpdateY") === true) {
        /**修改记录 */
        console.log('2')
        db.collection('text')
          .where({
            hiddenText: wx.getStorageSync('updateYin')
          }).get({
            success: res => {
              updateId = res.data[0]._id
              db.collection('text')
                .doc(updateId)
                .update({
                  data: {
                    hiddenText: this.userInput,
                    motifyTime: time,
                  }
                })
              const pages = getCurrentPages()
              const perpage = pages[pages.length - 1]
              perpage.onLoad()
              this.setData({
                userInput: '',
                sum: 0,
              })
              wx.setStorageSync('isUpdateY', false)
              //刷新功能不灵
              wx.showToast({
                title: '修改成功',
                icon: 'none',
                duration: 2000 //持续的时间
              })
            },
            fail: res => {
              console.log(res)
            }
          })
      } else if (wx.getStorageSync('hiddenText') === true) {
        console.log("3")
        db.collection('text')
          .where({
            area: wx.getStorageSync('updateText')
          }).get({
            success: res => {
              hiddenId = res.data[0]._id
              db.collection('text')
                .doc(hiddenId)
                .update({
                  data: {
                    hiddenText: this.userInput,
                  }
                })
              const pages = getCurrentPages()
              const perpage = pages[pages.length - 1]
              perpage.onLoad()
              this.setData({
                userInput: '',
                sum: 0,
              })
              wx.setStorageSync('hiddenText', false)
              wx.showToast({
                title: '提交成功',
                icon: 'none',
                duration: 2000 //持续的时间
              })
            }
          })
      } else {
        /**增加记录 */
        //用户记录不超过6条才可以继续添加记录
        // if (wx.getStorageSync("length") <= 5) {
        //如果用户当天已经发过记录，不能再次发送
        console.log("4")
        let curDate = util.formatTime1(time);
        db.collection('text')
          .where({
            _openid: wx.getStorageSync('openid')
          })
          .get({
            success: res => {
              console.log('检查', res.data)
              for (var i = 0; i < res.data.length; i++) {
                if (curDate === util.formatTime1(res.data[i].createTime)) {
                  wx.setStorageSync("isDate", 1)
                }
                console.log('hello')
              }
              //判断用户今天是否发过信息
              if (wx.getStorageSync("isDate") === "0") {
                db.collection('text').add({
                  data: {
                    area: this.userInput,
                    createTime: time,
                    motifyTime: time,
                    forget: true,
                    hiddenText: '',
                  },
                  success: res => {
                    console.log('2', time)
                    //提交记录后清空文本框中文字
                    this.setData({
                      userInput: '',
                      sum: 0,
                    })
                    wx.showToast({
                      title: '填入成功 ',
                      icon: 'none',
                      duration: 2000 //持续的时间
                    })
                    console.log('[数据库][新增记录]成功，记录 _id', res._id)
                    const pages = getCurrentPages()
                    const perpage = pages[pages.length - 1]
                    perpage.onLoad()
                  },
                  fail: err => {
                    wx.showToast({
                      icon: 'none',
                      title: '新增记录失败',
                    })
                    console.error('[数据库][新增记录]失败:', err)
                  }
                })
              } else {
                //用户当天已经发过记录
                wx.showToast({
                  title: '一天只能发送一条记录',
                  icon: 'none',
                  duration: 2000 //持续的时间
                })
              }
            }
          })
        // } else {
        //   wx.showToast({
        //     title: '记忆太多了',
        //     icon: 'none',
        //     duration: 2000 //持续的时间
        //   })
        // }
      }
      this.setData({
        typeT: false,
        showT: false,
        showF: false,
        showW: false,
        showZ: false,
        titleTips: '',
      })
      //触发成功回调
      this.triggerEvent("success");
    },

    //动态获取文本框字数
    bindWordLimit: function(e) {
      this.sum = e.detail.value.length;
      this.setData({
        sum: e.detail.value.length
      })
      this.userInput = e.detail.value;
    },

    _showOrCloseDialog: function(currentStatu) {
      var that = this;
      //关闭
      if (currentStatu == "close") {
        var animation = wx.createAnimation({
          duration: 400,
          timingFunction: 'linear'
        })
        that.animation = animation
        animation.translateY(400).step()
        that.setData({
          animationData: animation.export()
        })
        setTimeout(function() {
          animation.translateY(0).step()
          that.setData({
            animationData: animation.export(),
            flag: !that.data.flag
          })
        }, 200)
      }
      // 显示
      if (currentStatu == "open") {
        // 用that取代this，防止不必要的情况发生
        // 创建一个动画实例
        var animation = wx.createAnimation({
          // 动画持续时间
          duration: 400,
          // 定义动画效果，当前是匀速
          timingFunction: 'linear'
        })
        // 将该变量赋值给当前动画
        that.animation = animation
        // 先在y轴偏移，然后用step()完成一个动画
        animation.translateY(550).step()
        // 用setData改变当前动画
        that.setData({
          // 通过export()方法导出数据
          animationData: animation.export(),
        })
        // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
        setTimeout(function() {
          animation.translateY(0).step()
          that.setData({
            animationData: animation.export()
          })
        }, 200)
        that.setData({
          flag: !that.data.flag
        });
      }
    },

    _openTips() {
      console.log('sfjbdf')
      if (wx.getStorageSync('isUpdate')) {
        console.log("1")
        //修改记忆
        this.setData({
          typeT: true,
          showF: true,
          titleTips: '我好像写错了什么'
        })
      } else if (wx.getStorageSync('isUpdateY')) {
        //修改伪装
        console.log("2")
        this.setData({
          typeT: true,
          showZ: true,
          titleTips: '伪装得还不够完美'
        })
      } else if (wx.getStorageSync('hiddenText')) {
        //填入伪装
        console.log("3")
        this.setData({
          typeT: true,
          showW: true,
          titleTips: '我不想展示所有的我……'
        })
      } else {
        //填入记忆
        console.log("4")
        this.setData({
          typeT: true,
          showT: true,
          titleTips: '我想忘记它们……'
        })
      }
    },

    _explainT() {
      this.setData({
        typeT: false,
      })
    }
  },
})