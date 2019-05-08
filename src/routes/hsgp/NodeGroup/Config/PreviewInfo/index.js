/**
 * 节点组维护 - 新建节点组 - 配置预览步骤
 * @date: 2018-9-10
 * @author: 王家程 <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Icon, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import Codemirror from '../Codemirror';
import styles from '../index.less';

@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeGroup }) => ({
  nodeGroup,
  createLoading: loading.effects['nodeGroup/createNodeGroup'],
  updateLoading: loading.effects['nodeGroup/updateNodeGroup'],
}))
@formatterCollections({ code: 'hsgp.nodeGroup' })
export default class PreviewInfo extends React.PureComponent {
  /**
   * 确认发布
   */
  @Bind()
  handlePublish() {
    const {
      dispatch,
      nodeGroup,
      history,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
    } = this.props;
    const {
      appData,
      versionData,
      configData,
      commonNodeRuleList = [],
      grayNodeRuleList = [],
      nodeGroupDetail,
    } = nodeGroup;
    const { productServiceId } = versionData;
    const newRuleList = commonNodeRuleList.map(item => {
      return { nodeRuleId: item.nodeRuleId };
    });
    const newGrayRuleList = grayNodeRuleList.map(item => {
      return { nodeRuleId: item.nodeRuleId };
    });
    const params =
      nodeGroupId === 'create'
        ? {
            ...appData,
            commonNodeRuleList: newRuleList,
            grayNodeRuleList: newGrayRuleList,
            ...versionData,
            instanceConfig: configData.content,
            productId,
            productEnvId,
            // 提供服务版本id
            productServiceId: productServiceId[1],
          }
        : {
            ...nodeGroupDetail,
            ...appData,
            commonNodeRuleList: newRuleList,
            grayNodeRuleList: newGrayRuleList,
            ...versionData,
            instanceConfig: configData.content,
            productId,
            productEnvId,
            // 提供服务版本id
            productServiceId: productServiceId[1],
            nodeGroupId,
          };
    dispatch({
      type: `nodeGroup/${nodeGroupId === 'create' ? 'createNodeGroup' : 'updateNodeGroup'}`,
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        history.push('/hsgp/node-group/list');
      }
    });
  }

  /**
   * 前往上一步，编辑配置
   */
  @Bind()
  handlePreStep() {
    const {
      history,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
    } = this.props;
    history.push(`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/config`);
  }

  render() {
    const {
      createLoading,
      updateLoading,
      getCurrentStep,
      nodeGroup,
      match: {
        params: { nodeGroupId, productId },
      },
    } = this.props;
    const {
      appData,
      versionData,
      configData,
      productWithEnvList = [],
      productWithVersionList = [],
      serviceWithVersionList = [],
    } = nodeGroup;
    const { nodeGroupName, commonFlag, grayFlag } = appData;
    const { productVersionId, productServiceId = [] } = versionData;
    const { content } = configData;
    // 产品名称 meaning
    const [product = {}] = productWithEnvList.filter(item => item.value === productId);
    const { meaning: productName = '' } = product;
    // 产品版本 meaning
    const [productVersion = {}] = productWithVersionList.filter(
      item => item.value === productVersionId
    );
    const { meaning: productVersionName = '' } = productVersion;
    // 服务及版本 meaning
    const [service = {}] = serviceWithVersionList.filter(
      item => item.value === productServiceId[0]
    );
    const { meaning: serviceName = '', children = [] } = service;
    const [version = {}] = children.filter(item => item.value === productServiceId[1]);
    const { meaning: versionName = '' } = version;
    const codeMirrorProps = {
      value: content,
      options: {
        autoFocus: false,
        readOnly: 'nocursor',
      },
    };
    const saveLoading = nodeGroupId === 'create' ? createLoading : updateLoading;
    return (
      <Content>
        <div className={styles['preview-info']}>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              节点组名称：
            </span>
            {nodeGroupName}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              {intl.get('hsgp.nodeGroup.model.nodeGroup.commonGroupFlag').d('通用')}：
            </span>
            {commonFlag
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              {intl.get('hsgp.nodeGroup.model.nodeGroup.grayFlag').d('灰度')}：
            </span>
            {grayFlag
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              产品：
            </span>
            {productName}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              产品版本：
            </span>
            {productVersionName}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              服务/版本：
            </span>
            {`${serviceName}/${versionName}`}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>
              <Icon type="appstore-o" />
              {intl.get('hsgp.nodeGroup.view.message.title.info').d('配置信息')}：
            </span>
          </div>
          <div>
            <Codemirror codeMirrorProps={codeMirrorProps} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              style={{ marginRight: '8px' }}
              onClick={this.handlePublish}
              loading={saveLoading}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
            {getCurrentStep() !== 0 && (
              <Button onClick={this.handlePreStep} disabled={saveLoading}>
                {intl.get('hzero.common.button.previous').d('上一步')}
              </Button>
            )}
          </div>
        </div>
      </Content>
    );
  }
}
