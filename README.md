## image-crop介绍

image-crop是一款移动端图片裁切组件;

在[AlloyCrop](https://github.com/AlloyTeam/AlloyCrop)的基础上做了一些改造：
* 新增图片选择/拍照，使用exif.js获取图片的Orientation，并做相应的旋转
* 限制图片移动和缩小范围，防止不覆盖满整个截图框

## API
```
<link rel="stylesheet" type="text/css" href="css/AlloyCrop.css">
<script src="js/exif.js"></script>
<script src="js/transform.js"></script>
<script src="js/alloy-finger.js"></script>
<script src="js/alloy-crop.js"></script>
```
```js
new AlloyCrop({
    input: "#inputFile",
    croppingBox: "#box",
    width: 200, // crop width
    height: 100, // crop height
    output: 2, // output resolution --> 400*200
    ok: function (base64, canvas) { },
    cancel: function () { },
    ok_text: "yes", // optional parameters , the default value is ok
    cancel_text: "no" // optional parameters , the default value is cancel
});
```

参数 |是否必填 | 意义
----|------|----
input | 必须  | input file标签
croppingBox | 不必须 | 在指定标签区域内操作裁切；如果没有则会弹出一个覆盖全页面的弹出层，在弹出层内操作裁切
width | 必须  | 选区的宽
height | 必须  | 选区的高
output | 不必须，默认是1 | 输出的倍率。比如如果output为2，选区的宽300，选区的高100，输出的图像的分辨率为 (2×300，2×100）
ok | 必须  | 点击ok按钮的回调，返回裁切好的图片的base64或canvas
cancel | 必须  | 点击cancel按钮的回调
ok_text | 不必须，默认是ok  | ok按钮的文本
cancel_text | 不必须，默认是cancel  | cancel按钮的文本

其他文档可参考[AlloyCrop](https://github.com/AlloyTeam/AlloyCrop)

## Demo

demo1-在指定区域内操作裁切

![](./img/demo1.png)

demo2-弹出层操作裁切

![](./img/demo2.png)

## Dependencies
* [AlloyFinger](https://github.com/AlloyTeam/AlloyFinger)
* [css3transform](https://alloyteam.github.io/AlloyTouch/transformjs/)
* [AlloyCrop](https://github.com/AlloyTeam/AlloyCrop)
* [Exif.js](http://code.ciaoca.com/javascript/exif-js/)


## License
This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
