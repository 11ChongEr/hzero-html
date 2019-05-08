import React, { Component } from 'react';

import DynamicPage from 'components/DynamicComponent/DynamicPage';

export default class ApproveForm extends Component {
  approveFormDynamic;

  formFlag = false;

  componentDidMount() {
    if (!this.formFlag) {
      if (this.approveForm && typeof window.addEventListener !== 'undefined') {
        window.addEventListener('message', this.onMessage, false);
      } else if (typeof window.attachEvent !== 'undefined') {
        // for ie
        window.attachEvent('onmessage', this.onMessage);
      }
    }
  }

  /**
   * iframe回调postMessage，解决跨域问题
   *
   */
  onMessage = event => {
    let dom = null;
    if (this.approveForm) {
      dom = this.approveForm.contentWindow;
    }
    if (event.source !== dom) {
      return;
    }
    if (typeof event.data === 'string') {
      const data = JSON.parse(event.data);
      this.props.onAction(data);
    }
  };

  /**
   * 向iframe发送postMessage，解决跨域问题
   *
   */
  iframePostMessage = approveResult => {
    if (!this.formFlag) {
      // iframe
      const dom = this.approveForm;
      const data = { approveResult };
      if (dom) {
        dom.contentWindow.postMessage(JSON.stringify(data), '*');
      }
    } else {
      // 是tpl动态表单时的处理方法
      this.approveFormDynamic.getData().then(
        data => {
          const d = { ...data, test: 'aaaa' };
          this.props.onAction(d);
        },
        err => {
          throw err;
        }
      );
    }
  };

  render() {
    const { detail } = this.props;
    const { formKey } = detail;
    let formKeyV = null;
    let dynamicCode = '';
    if (detail.formKey) {
      if (formKey.indexOf('?') > 0) {
        formKeyV = `${formKey}&businessKey=${detail.processInstance.businessKey}`;
      } else {
        formKeyV = `${formKey}?businessKey=${detail.processInstance.businessKey}`;
      }
      this.formFlag = formKey.substring(0, 4) === 'tpl:';

      dynamicCode = this.formFlag ? formKey.slice(6) : '';
    }

    const approveForm = this.formFlag ? (
      <DynamicPage
        onRef={ref => {
          this.approveFormDynamic = ref;
        }}
        pageCode={dynamicCode}
        params={{ businessKey: detail.processInstance.businessKey }}
      />
    ) : (
      <iframe
        id="includeFrame"
        ref={ref => {
          this.approveForm = ref;
        }}
        title="iframe"
        src={formKeyV}
        width="100%"
        height="450px"
        frameBorder="0"
      />
    );

    return <React.Fragment>{approveForm}</React.Fragment>;
  }
}
