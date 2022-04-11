/**
	* @title 		弹窗插件wcPop-v1.0 beta (UTF-8)
	* @Create		hison
	* @Timer		2018-03-30 11:30:45 GMT+0800 (中国标准时间)
*/
!function(win){
	var _doc = win.document, _docEle = _doc.documentElement, index = 0,
	util = {
		$: function(id){
			return _doc.getElementById(id);
		},
		touch: function(o, fn){
			o.addEventListener("click", function(e){
				fn.call(this, e);
			}, !1);
		},
		//获取插件js路径
		jspath: function(){
			for(var s = _doc.getElementsByTagName("script"), i = s.length; i > 0; i--)
				if (s[i - 1].src && s[i - 1].src.match(/wcPop[\w\-\.]*\.js/) != null)
					return s[i-1].src.substring(0, s[i-1].src.lastIndexOf("/")+1);
		},
		timer: {}
	},
	wcPop = function(options){
		var _this = this,
			config = {
				id: 'wcPop',			//弹窗ID标识 (不同ID对应不同弹窗)
				title: '',					 //标题
				content: '',			 //内容
				style: '',					//自定弹窗样式
				skin: '',					//自定弹窗显示风格 ->目前支持配置 toast(仿微信toast风格) footer(底部对话框风格)、msg(普通提示)
				icon: '',					//弹窗小图标(success | info | error | loading)
				
				shade: true,			//是否显示遮罩层
				shadeClose: true,	//是否点击遮罩时关闭层
				anim: 'scaleIn',		//scaleIn：缩放打开(默认)  fadeIn：渐变打开  fadeInUpBig：由上向下打开 fadeInDownBig：由下向上打开  rollIn：左侧翻转打开  shake：震动  footer：底部向上弹出
				time: 0,					//设置弹窗自动关闭秒数1、 2、 3
				zIndex: 9999,			//设置元素层叠
				
				btns: null,					//不设置则不显示按钮，btn参数: [{按钮1配置}, {按钮2配置}]
				end: null					//层销毁后的回调函数
			};
		
		_this.opts = options;
		for(var i in config){
			if(!(i in _this.opts)){
				_this.opts[i] = config[i];
			}
		}
		_this.init();
	};
	
	wcPop.prototype = {
		init: function(){
			var _this = this, opt = _this.opts, xwbox = null,
			ftBtns = function(){
				if(!opt.btns) return;
				var btnTpl = "";
				for(var i in opt.btns){
					btnTpl += '<span class="btn" data-index="'+i+'" style="'+(opt.btns[i].style ? opt.btns[i].style : '')+'">'+opt.btns[i].text+'</span>';
				}
				return btnTpl;
			}();
			
			util.$(opt.id) ? (xwbox = util.$(opt.id)) : (xwbox = _doc.createElement("div"), xwbox.id = opt.id);
			xwbox.setAttribute("index", index);
			xwbox.setAttribute("class", "wcPop wcPop"+index);
			xwbox.innerHTML = [
				'<div class="popui__modal-panel">',
					/**遮罩*/
					opt.shade ? ('<div class="popui__modal-mask" style="z-index:'+(_this.maxIndex()+1)+'"></div>') : '',
					/**窗体*/
					'<div class="popui__panel-main" style="z-index:'+(_this.maxIndex()+2)+'">\
						<div class="popui__panel-section">\
							<div class="popui__panel-child '+(opt.anim ? 'anim-'+opt.anim : '')+' '+(opt.skin ? 'popui__'+opt.skin : '')+'" style="'+opt.style+'">',
								opt.title ? ('<div class="popui__panel-tit">'+opt.title+'</div>') : '',
								'<div class="popui__panel-cnt">',
									(opt.skin == "toast" && opt.icon ? ('<div class="popui__toast-icon"><img class="'+(opt.icon == "loading" ? "anim-loading" : '')+'" src="'+util.jspath()+'skin/'+opt.icon+'.png" /></div>') : '') + opt.content,
								'</div>',
								opt.btns ?
								'<div class="popui__panel-btnwrap">\
									<div class="popui__panel-btn">'+ftBtns+'</div>\
								</div>' : '',
							'</div>\
						</div>\
					</div>\
				</div>'
			].join('');
			//_doc.body.insertBefore(xwbox, _doc.body.childNodes[0]);
			_doc.body.appendChild(xwbox);
			
			this.index = index++;
			_this.callback();
		},
		callback: function(){
			var _this = this, opt = _this.opts;
			//自动关闭弹窗
			if(opt.time){
				util.timer[_this.index] = setTimeout(function(){
					interface.close(_this.index);
					typeof opt.end == "function" && opt.end.call(_this);
				}, opt.time * 1000);
			}
			
			//按钮事件
			if(opt.btns){
				for (var o = _doc.getElementsByClassName("popui__panel-btn")[0].children, len = o.length, i = 0; i < len; i++)
					util.touch(o[i], function(e){
						var idx = this.getAttribute("data-index"), btn = opt.btns[idx];
						typeof btn.onTap === "function" && btn.onTap(e);
					});
			}
			//点击遮罩层关闭
			if(opt.shade && opt.shadeClose){
				var c = _doc.getElementsByClassName("popui__modal-mask")[0];
				util.touch(c, function () {
					interface.close(_this.index)
				});
			}
		},
		//获取弹窗最大层级
		maxIndex: function(){
			for(var idx = this.opts.zIndex, elem = _doc.getElementsByTagName("*"), i = 0, len = elem.length; i < len; i++)
				idx = Math.max(idx, elem[i].style.zIndex);
			return idx;
		}
	};
	
	var interface = (function(){
		//实例化弹窗(返回 弹窗索引值)
		exports = function(args){
			var o = new wcPop(args);
			return o.index;
		};
		
		//关闭弹窗
		exports.close = function(index){
			var index = index ? index : "";
			var o = _doc.getElementsByClassName("wcPop"+index)[0];
			
			if(o){
				_doc.body.removeChild(o);
				clearTimeout(util.timer[index]);
				delete util.timer[index];
			}
		}
		
		//加载css
		exports.load = function(path){
			for(var ck = _doc.createElement("link"), lk = _doc.getElementsByTagName("link"), i = lk.length; i > 0; i--)
				if(lk[i-1].href == path) return;
			ck.type="text/css";
			ck.rel = "stylesheet";
			ck.href = util.jspath() + path;
			_doc.getElementsByTagName("head")[0].appendChild(ck);
		};
		
		//更多接口
		exports.expectInterface = function(title, content, time){
			var param = {
				title: title, content: content, time: time
			}
			exports(param);
		};
		
		return exports;
	}());
	
	//加载css
	interface.load("skin/wcPop.css");
	
	win.wcPop = interface;
}(window);