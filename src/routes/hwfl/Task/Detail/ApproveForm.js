import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';

import DynamicPage from 'components/DynamicComponent/DynamicPage';

import { getAccessToken } from 'utils/utils';

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
  @Bind()
  onMessage(event) {
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
  }

  /**
   * 向iframe发送postMessage，解决跨域问题
   *
   */
  @Bind()
  iframePostMessage(approveResult) {
    if (!this.formFlag) {
      // iframe
      const dom = this.approveForm;
      const data = { approveResult };
      if (dom) {
        dom.contentWindow.postMessage(JSON.stringify(data), '*');
      }
      // TODO 2019.3.12增加line54(只查看iframe中的内容就能审批，不用交互)
      this.props.onAction(data);
    } else {
      // 是tpl动态表单时的处理方法
      this.approveFormDynamic.trialDataSubmit().then(
        () => {
          this.props.onAction();
        }
        // err => {
        // notification.error({ message: err.message});
        // }
      );
    }
  }

  render() {
    const { currentDetailData, tenantId } = this.props;
    const { formKey } = currentDetailData;
    let formKeyV = null;
    let dynamicCode = '';
    if (currentDetailData.formKey) {
      const accessToken = getAccessToken('access_token');
      const regexp = new RegExp(`{access_token}`, 'g');
      const ret = formKey.replace(regexp, accessToken);
      if (formKey.indexOf('?') > 0) {
        formKeyV = `${ret}&businessKey=${currentDetailData.processInstance.businessKey}`;
      } else {
        formKeyV = `${ret}?businessKey=${currentDetailData.processInstance.businessKey}`;
      }
      this.formFlag = ret.substring(0, 4) === 'tpl:';

      dynamicCode = this.formFlag ? formKey.slice(6) : '';
    }

    const approveForm = this.formFlag ? (
      <DynamicPage
        onRef={ref => {
          this.approveFormDynamic = ref;
        }}
        pageCode={dynamicCode}
        params={{
          businessKey: currentDetailData.processInstance.businessKey,
          organizationId: tenantId,
        }}
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
