/* AlloyCrop v1.0.1
 * By dntzhang
 * Github: https://github.com/AlloyTeam/AlloyCrop
 * re-edit by sang 2017-12-25
 */
;(function(){
    var AlloyFinger = typeof require === 'function' ? require('alloyfinger') : window.AlloyFinger;
    var Transform = typeof require === 'function' ? require('css3transform') : window.Transform;

    var AlloyCrop = function (option) {
        var self = this;
        if (option.input) {
            var inputFile = document.querySelector(option.input);
            inputFile.onchange = function (e){
                var img;
                var file = e.target.files['0'];
                var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式  
                if (!rFilter.test(file.type)) {  
                    alert("请选择jpeg、png格式的图片", false);
                    return;  
                }
                self.loading = document.createElement("div");
                self.loading.setAttribute('class', 'AlloyCrop-loading');
                document.body.appendChild(self.loading);
                var Orientation = null;
                if (file) {
                    EXIF.getData(file, function () {
                        EXIF.getAllTags(this);
                        Orientation = EXIF.getTag(this, 'Orientation');
                    });
                    var oReader = new FileReader();
                    oReader.onload = function (e) {
                        var image = new Image();
                        image.src = e.target.result;
                        image.onload = function () {
                            var w = this.naturalWidth;
                            var h = this.naturalHeight;
                            var cx = 0;
                            var cy = 0;
                            var cw = w;
                            var ch = h;
                            var degree = 0;
                            if (Orientation && Orientation !== '' && Orientation !== 1) {
                                switch (Orientation) {
                                    case 6:
                                        cw = h;
                                        ch = w;
                                        cy = -h;
                                        degree = 90;
                                        break;
                                    case 8:
                                        cw = h;
                                        ch = w;
                                        cx = -w;
                                        degree = -90;
                                        break;
                                    case 3:
                                        cx = -w;
                                        cy = -h;
                                        degree = -180;
                                        break;
                                }
                            } else {
                                degree = 0;
                            }
                            var canvas = document.createElement('canvas');
                            var ctx = canvas.getContext('2d');
                            canvas.width = cw;
                            canvas.height = ch;
                            ctx.rotate(degree * Math.PI / 180);
                            ctx.drawImage(image, cx, cy, w, h);
                            img = canvas.toDataURL('image/jpeg');
                            self.selectFileImage(option, img);
                        };
                    };
                    oReader.readAsDataURL(file);
                }
            };
        } else {
            console.error('没有指定input file');
        }
    };

    AlloyCrop.prototype = {
        selectFileImage: function (option, theImg) {
            this.width = option.width;
            this.height = option.height;
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.output = option.output ? option.output : 1;
            this.canvas.width = this.width * this.output;
            this.canvas.height = this.width * this.output;
            this.circle = option.circle;
            if (option.width !== option.height && option.circle) {
                throw "can't set circle to true when width is not equal to height";
            }
            this.type = option.type || "png";
            this.fullScreen = true;
            if (option.croppingBox) {
                this.fullScreen = false;
            }

            this.cancel = option.cancel;
            this.ok = option.ok;
            this.ok_text = option.ok_text || "ok";
            this.cancel_text = option.cancel_text || "cancel";
            this.cancel_btn = document.createElement('a');
            this.cancel_btn.innerHTML = this.cancel_text;
            this.cancel_btn.setAttribute('class', 'AlloyCrop-cancel');
            this.ok_btn = document.createElement('a');
            this.ok_btn.innerHTML = this.ok_text;
            this.ok_btn.setAttribute('class', 'AlloyCrop-ok');

            if (!this.fullScreen) {
                this.container = document.querySelector(option.croppingBox);
                this.container.innerHTML = '';
                this.croppingBox = document.createElement("div");
                this.croppingBox.setAttribute('class', 'AlloyCrop-croppingBox');
                this.croppingBox.style.width = this.width + 'px';
                this.croppingBox.style.height = this.height + 'px';
                this.coverWidth = this.width;
                this.coverHeight = this.height;
                this.container.appendChild(this.croppingBox);
                this.container.appendChild(this.ok_btn);
                this.container.appendChild(this.cancel_btn);
            } else {
                this.renderTo = document.body;
                this.croppingBox = document.createElement("div");
                this.croppingBox.setAttribute('class', 'AlloyCrop-popBox');
                this.croppingBox.style.visibility = "hidden";
                this.cover = document.createElement("canvas");
                this.cover.setAttribute('class', 'AlloyCrop-cover');
                this.coverWidth = window.innerWidth;
                this.coverHeight = window.innerHeight;
                this.cover.width = this.coverWidth;
                this.cover.height = this.coverHeight;
                this.cover_ctx = this.cover.getContext("2d");
                this.croppingBox.appendChild(this.cover);
                this.renderTo.appendChild(this.croppingBox);
                this.croppingBox.appendChild(this.ok_btn);
                this.croppingBox.appendChild(this.cancel_btn);
            }

            this.img = document.createElement("img");
            this.croppingBox.appendChild(this.img);
            this.img.onload = this.init.bind(this);
            this.img.src = theImg;
        },
        init: function () {
            var self = this;
            this.img_width = this.img.width;
            this.img_height = this.img.height;
            Transform(this.img,true);
            var scaling_x = this.coverWidth / this.img_width,
                scaling_y = this.coverHeight / this.img_height;
            var scaling = scaling_x > scaling_y ? scaling_y : scaling_x;
            var sX = this.width / this.img.width;
            var sY = this.height / this.img.height;
            var minScale = sX > sY ? sX : sY;
            var s = scaling > minScale ? scaling : minScale;
            this.minScale = minScale;
            this.initScale = s;
            this.originScale = s;
            this.img.scaleX = this.img.scaleY = s;
            /*
            this.initScale = scaling_x;
            this.originScale = scaling_x;
            this.img.scaleX = this.img.scaleY = scaling_x;
            */
            this.first = 1;
            new AlloyFinger(this.croppingBox, {
                multipointStart: function (evt) {
                    //reset origin x and y
                    var centerX = (evt.touches[0].pageX + evt.touches[1].pageX) / 2;
                    var centerY = (evt.touches[0].pageY + evt.touches[1].pageY) / 2;
                    var cr = self.img.getBoundingClientRect();
                    var img_centerX = cr.left + cr.width / 2;
                    var img_centerY = cr.top + cr.height / 2;
                    var offX = centerX - img_centerX;
                    var offY = centerY - img_centerY;
                    var preOriginX = self.img.originX;
                    var preOriginY = self.img.originY;
                    self.img.originX = offX / self.img.scaleX;
                    self.img.originY = offY / self.img.scaleY;
                    //reset translateX and translateY
                    
                    self.img.translateX += offX - preOriginX * self.img.scaleX;
                    self.img.translateY += offY - preOriginY * self.img.scaleX;

                    
                    if(self.first == 1){
                        self.img.scaleX = self.img.scaleY = self.initScale * 1.1;
                        ++self.first;
                    }

                    self.initScale = self.img.scaleX;
                    
                },
                pinch: function (evt) {
                    //self.img.scaleX = self.img.scaleY = self.initScale * evt.zoom;
                    
                    var cr = self.img.getBoundingClientRect();
                    var boxCR = self.croppingBox.getBoundingClientRect();
                    var boxOffY,boxOffX;
                    if (self.fullScreen) {
                        boxOffY = (self.coverHeight - self.height)/2;
                        boxOffX = (self.coverWidth - self.width)/2;
                    } else {
                        boxOffY = boxCR.top;
                        boxOffX = boxCR.left;
                    }
                    
                    var tempo = evt.zoom;
                    var dw = (cr.width * tempo - cr.width)/2;
                    var dh = (cr.height - cr.height * tempo)/2;

                    if( (self.initScale * tempo >= self.minScale) && (cr.left <= boxOffX) && (cr.right >= boxOffX + self.width) && (boxOffY - cr.top >= 0) && (cr.bottom - boxOffY >= self.height)){
                        self.img.scaleX = self.img.scaleY = self.initScale * tempo;
                    }
                },  
                pressMove: function (evt) {
                    var cr = self.img.getBoundingClientRect();
                    var boxCR = self.croppingBox.getBoundingClientRect();
                    var boxOffY,boxOffX;
                    if (self.fullScreen) {
                        boxOffY = (self.coverHeight - self.height)/2;
                        boxOffX = (self.coverWidth - self.width)/2;
                    } else {
                        boxOffY = boxCR.top;
                        boxOffX = boxCR.left;
                    }
                    if((cr.left + evt.deltaX <= boxOffX) && (cr.right + evt.deltaX >= boxOffX+self.width)){
                        self.img.translateX += evt.deltaX;  
                    }
                    if((boxOffY - cr.top - evt.deltaY >= 0) && (cr.bottom + evt.deltaY - boxOffY >= self.height)){
                        self.img.translateY += evt.deltaY;
                    }
                    evt.preventDefault();
                }
            });

            new AlloyFinger(self.cancel_btn, {
                tap: self._cancel.bind(self)
            });

            new AlloyFinger(self.ok_btn, {
                tap: self._ok.bind(self)
            });

            if (self.fullScreen) {
                self.renderCover();
            }
            self.setStyle();
            setTimeout(function(){
                self.loading.remove();
            },1000);
        },
        _cancel: function () {
            if (this.fullScreen) {
                this._css(this.croppingBox, {
                    display: "none"
                });
            }
            this.cancel();
        },
        _ok: function () {
            this.crop();
            if (this.fullScreen) {
                this._css(this.croppingBox, {
                    display: "none"
                });
            }
            this.ok(this.canvas.toDataURL("image/" + this.type), this.canvas);
        },
        renderCover: function () {
            var ctx = this.cover_ctx,
                w = this.coverWidth,
                h = this.coverHeight,
                cw = this.width,
                ch = this.height;
            ctx.save();
            ctx.fillStyle = "black";
            ctx.globalAlpha = 0.7;
            ctx.fillRect(0, 0, this.coverWidth, this.coverHeight);
            ctx.restore();
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            if (this.circle) {
                ctx.arc(w / 2, h / 2, cw / 2 - 4, 0, Math.PI * 2, false);
            } else {
                ctx.rect(w / 2 - cw / 2, h / 2 - ch / 2, cw, ch);
            }
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "white";
            if (this.circle) {
                ctx.arc(w / 2, h / 2, cw / 2 - 4, 0, Math.PI * 2, false);
            } else {
                ctx.rect(w / 2 - cw / 2, h / 2 - ch / 2, cw, ch);
            }
            ctx.stroke();
        },
        setStyle: function () {
            if (this.fullScreen){
                this._css(this.croppingBox, {
                    visibility: "visible"
                });
            }
            this._css(this.img, {
                position: "absolute",
                zIndex: "99",
                left: "50%",
                // error position in meizu when set the top  50%
                top: this.coverHeight / 2 + "px",
                marginLeft: this.img_width / -2 + "px",
                marginTop: this.img_height / -2 + "px"
            });
        },
        crop: function () {
            this.calculateRect();
            //this.ctx.drawImage(this.img, this.crop_rect[0], this.crop_rect[1], this.crop_rect[2], this.crop_rect[3], 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.img, this.crop_rect[0], this.crop_rect[1], this.crop_rect[2], this.crop_rect[3], 0, 0, this.crop_rect[2]*this.img.scaleX*this.output, this.crop_rect[3]*this.img.scaleY*this.output);
        },
        calculateRect: function () {
            var cr = this.img.getBoundingClientRect();
            var boxCR = this.croppingBox.getBoundingClientRect();
            var imgLeft = cr.left - boxCR.left;
            var imgRight = cr.right - boxCR.right;
            var imgTop = cr.top - boxCR.top;
            var imgBottom = cr.bottom - boxCR.bottom;

            var c_left = this.coverWidth / 2 - this.width / 2;
            var c_top = this.coverHeight / 2 - this.height / 2;
            var cover_rect = [c_left, c_top, this.width + c_left, this.height + c_top];
            var img_rect = [imgLeft, imgTop, cr.width + imgLeft, cr.height + imgTop];
            var intersect_rect = this.getOverlap.apply(this, cover_rect.concat(img_rect));
            var left = (intersect_rect[0] - img_rect[0]) / this.img.scaleX;
            var top = (intersect_rect[1] - img_rect[1]) / this.img.scaleY;
            var width = intersect_rect[2] / this.img.scaleX;
            var height = intersect_rect[3] / this.img.scaleY;

            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left + width > this.img_width) width = this.img_width - left;
            if (top + height > this.img_height) height = this.img_height - top;

            this.crop_rect = [left, top, width, height];
        },
        // top left (x1,y1) and bottom right (x2,y2) coordination
        getOverlap: function (ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
            if (ax2 < bx1 || ay2 < by1 || ax1 > bx2 || ay1 > by2) return [0, 0, 0, 0];

            var left = Math.max(ax1, bx1);
            var top = Math.max(ay1, by1);
            var right = Math.min(ax2, bx2);
            var bottom = Math.min(ay2, by2);
            return [left, top, right - left, bottom - top];
        },
        _css: function (el, obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    el.style[key] = obj[key];
                }
            }
        }
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = AlloyCrop;
    }else {
        window.AlloyCrop = AlloyCrop;
    }
})();
