// 默认配置
const defualtConfig = { id: `watermark_${Date.now()}`, messages: [], canWidth: 200, canHeight: 200, imgUrl: '' };

// 设置水印方法
function setWatermark(targetEle, config = {}) {
  let { messages, id, canWidth, canHeight, imgUrl } = Object.assign({}, defualtConfig, config);

  // 返回值
  const returnData = { watermarkEle: null, styleStr: '', imgUrl: '' };

  if (!messages.length) messages = ['敏感信息', '请勿外传'];

  // 创建 canvas 元素
  let can = document.createElement('canvas');
  can.width = canWidth;
  can.height = canHeight;

  // 获取 canvas 画布
  let cans = can.getContext('2d');

  // 将画布倾斜
  cans.rotate((-40 * Math.PI) / 180);

  // 设置文本相关样式
  cans.font = '12px "Microsoft YaHei"';
  cans.fillStyle = 'rgba(0, 0, 0, 0.3)';
  cans.textAlign = 'center';
  cans.textBaseline = 'Middle';

  // 为画布填充文本内容
  const x = canWidth / 20;
  let len = messages.length;
  messages.forEach(msg => {
    const y = canHeight - 20 * len;
    cans.fillText(msg, x, y, canWidth);
    len--;
  });

  const canUrl = can.toDataURL('image/png');

  // 水印容器样式
  const styleStr = `
  pointer-events: none;
  position: fixed;
  z-index: 100000;
  top: 10px;
  left: 0px;
  width: ${targetEle.clientWidth}px;
  height: ${targetEle.clientHeight}px;
  background: url(${canUrl}) left top repeat;
  `;

  // 将水印容器 div 放到目标元素之下
  let div = document.getElementById(id) || document.createElement('div');
  div.id = id;
  div.style = styleStr;
  targetEle.appendChild(div);

  returnData.imgUrl = canUrl;
  returnData.styleStr = styleStr;
  returnData.watermarkEle = div;

  return returnData;
};

// 监测
function observerEle(el, watermarkEle, styleStr) {
  // 初始化 MutationObserve
  const observer = new MutationObserver((mutationRecord, mutationObserver) => {

    const style = watermarkEle?.getAttribute('style');

    const isRemove = mutationRecord[0]?.removedNodes[0] === watermarkEle;

    // 属于元素被删除
    if (isRemove) {
      createWatermark(el);
    } else if (watermarkEle && style !== styleStr) {
      // 属于修改 style
      watermarkEle.setAttribute('style', styleStr);
    }

    console.log(watermarkEle, style !== styleStr, styleStr);

  });

  // 启动监听
  observer.observe(el, {
    childList: true,
    attributes: true,
    subtree: true,
  });
}

// 创建水印
function createWatermark(el = document.body, config) {
  if (el.tagName === 'IMG') {
    el = el.parentElement;
  }

  const { watermarkEle, styleStr } = setWatermark(el, config);

  observerEle(el, watermarkEle, styleStr);
}