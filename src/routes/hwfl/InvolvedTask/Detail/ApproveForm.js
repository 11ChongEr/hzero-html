import React, { Component } from 'react';

import DynamicPage from 'components/DynamicComponent/DynamicPage';

export default class ApproveForm extends Component {
  approveForm;

  formFlag = false;

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
          this.approveForm = ref;
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
