// component/whatever.js
var util = require('../../utils/util.js')
Component({
  onLoad: function() {},
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title1: { // 属性名
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题' // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
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
    flag1: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hidePopup1: function() {
      this._showOrCloseDialog("close")
    },
    //展示弹框
    showPopup1() {
      //检查用户是否授权
      const db = wx.cloud.database({
        env: 'js-s5vgs'
      })
      db.collection('user').where({
        _openid: wx.getStorageSync('openid')
      }).get({
        success: res => {
          console.log(res.data[0].look)
          if (res.data[0].look === true) {
            wx.navigateTo({
              url: '../otherPage/otherPage',
            })
          } else {
            this._showOrCloseDialog("open")
          }
        }
      })
    },
    /*
     * 内部私有方法建议以下划线开头
     * triggerEvent 用于触发事件
     */
    _error1() {
      //触发取消回调
      this.triggerEvent("error")
    },
    _success1() {
      var time = util.formatTime(new Date());
      // 再通过setData更改Page()里面的data，动态更新页面的数据
      this.setData({
        time: time
      });
      const db = wx.cloud.database()
      var updateId = ''
      /**修改记录 */
      db.collection('user')
        .where({
          _openid: wx.getStorageSync('openid')
        }).get({
          success: res => {
            updateId = res.data[0]._id
            db.collection('user')
              .doc(updateId)
              .update({
                data: {
                  look: true,
                }
              })
            const pages = getCurrentPages()
            const perpage = pages[pages.length - 1]
            perpage.onLoad()
            wx.showToast({
              title: '授权成功',
              icon: 'none',
              duration: 2000 //持续的时间
            })
            //授权成功转跳到新页面
            wx.navigateTo({
              url: '../otherPage/otherPage',
            })
          }
        })
      //触发成功回调
      this.triggerEvent("success");
    },
    _showOrCloseDialog: function(currentStatu) {
      var that = this;
      /* 动画部分 */
      // 第1步：创建动画实例 
      var animation = wx.createAnimation({
        duration: 200, //动画时长
        timingFunction: "linear", //线性
        delay: 0 //0则不延迟
      });
      // 第2步：这个动画实例赋给当前的动画实例
      this.animation = animation;
      // 第3步：执行第一组动画
      animation.opacity(0).rotateX(-100).step();
      // 第4步：导出动画对象赋给数据对象储存
      that.setData({
        animationData: animation.export()
      })
      // 第5步：设置定时器到指定时候后，执行第二组动画
      setTimeout(function() {
        // 执行第二组动画
        animation.opacity(1).rotateX(0).step();
        // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
        that.setData({
          animationData: animation
        })
        //关闭
        if (currentStatu == "close") {
          that.setData({
            flag1: !this.data.flag1
          });
        }
      }.bind(this), 200)
      // 显示
      if (currentStatu == "open") {
        that.setData({
          flag1: !this.data.flag1
        });
      }
    },
    //解决滚动穿透问题
    myCatchTouch: function () {
      return
    }
  }
})