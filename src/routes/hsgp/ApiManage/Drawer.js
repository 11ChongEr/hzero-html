import React from 'react';
import { Modal, Spin, Table, Divider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import styles from './index.less';

export default class ApiManageForm extends React.PureComponent {
  /**
   * 设置单元格属性
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 220,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const { title, modalVisible, loading, onCancel, initLoading = false, initData } = this.props;
    const {
      path,
      method,
      tag,
      code,
      apiLevel,
      description,
      loginAccess,
      publicAccess,
      upgradeApiMethod,
      upgradeApiPath,
      statusList = [],
      parameterList = [],
      relyApiList = [],
      passiveRelyApiList = [],
    } = initData;
    const paramsColumns = [
      {
        title: intl.get('hsgp.apiManage.model.apiManage.name').d('参数名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.type').d('参数类型'),
        width: 150,
        dataIndex: 'type',
      },
    ];
    const columns = [
      {
        title: intl.get('hsgp.apiManage.model.apiManage.code').d('编码'),
        dataIndex: 'code',
        width: 220,
        onCell: this.onCell,
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.api').d('API'),
        dataIndex: 'path',
        width: 220,
        onCell: this.onCell,
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.method').d('方法'),
        width: 80,
        dataIndex: 'method',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.apiManage.model.apiManage.serviceCode').d('服务'),
        width: 150,
        dataIndex: 'serviceCode',
      },
    ];
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        width={820}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        footer={null}
      >
        <Spin spinning={initLoading} wrapperClassName={styles['api-manage-detail']}>
          <div className={styles['api-info-wrapper']}>
            <Divider orientation="left">
              {intl.get('hsgp.apiManage.view.message.editor.apiInfo').d('API 信息')}
            </Divider>
            <div>
              <span>{intl.get('hsgp.apiManage.model.apiManage.tag').d('标签')}: </span>
              {tag}
            </div>
            <div>
              <span>{intl.get('hsgp.apiManage.model.apiManage.code').d('编码')}:</span>
              {code}
            </div>
            <div>
              <span>{intl.get('hsgp.apiManage.model.apiManage.api').d('API')}: </span>
              {path}
            </div>
            <div>
              <span>{intl.get('hsgp.apiManage.model.apiManage.method').d('方法')}: </span>
              {method}
            </div>
            <div>
              <span>{intl.get('hsgp.apiManage.model.apiManage.apiLevel').d('层级')}: </span>
              {apiLevel}
            </div>
            <div>
              <span>{intl.get('hsgp.common.model.common.description').d('描述')}: </span>
              {description}
            </div>
            <div>
              <span>
                {intl.get('hsgp.apiManage.model.apiManage.publicAccess').d('公开的接口')}:{' '}
              </span>
              {publicAccess ? '是' : '否'}
            </div>
            <div>
              <span>
                {intl.get('hsgp.apiManage.model.apiManage.loginAccess').d('登录可访问')}:{' '}
              </span>
              {loginAccess ? '是' : '否'}
            </div>
          </div>
          {statusList.some(item => {
            return item.code === 'UPGRADEABLE';
          }) && (
            <div className={styles['api-info-wrapper']}>
              <Divider orientation="left">
                {intl.get('hsgp.apiManage.view.message.editor.apiLevel').d('API 升级')}
              </Divider>
              <div>
                <span>
                  {intl.get('hsgp.apiManage.model.apiManage.upgradeApiMethod').d('方法')}:{' '}
                </span>
                {upgradeApiMethod}
              </div>
              <div>
                <span>
                  {intl.get('hsgp.apiManage.model.apiManage.upgradeApiPath').d('升级API')}:{' '}
                </span>
                {upgradeApiPath}
              </div>
            </div>
          )}
          <div style={{ margin: '10 0' }}>
            <Divider orientation="left">
              {intl.get('hsgp.apiManage.view.message.editor.parameter').d('请求参数')}
            </Divider>
            <Table
              rowKey="name"
              bordered
              columns={paramsColumns}
              scroll={{ x: tableScrollWidth(paramsColumns) }}
              dataSource={parameterList}
              pagination={false}
            />
          </div>
          <div style={{ margin: '10 0' }}>
            <Divider orientation="left">
              {intl.get('hsgp.apiManage.view.message.editor.relyApi').d('依赖的 API')}
            </Divider>
            <Table
              bordered
              columns={columns}
              scroll={{ x: tableScrollWidth(columns) }}
              dataSource={relyApiList}
              pagination={false}
            />
          </div>
          <div style={{ margin: '10 0' }}>
            <Divider orientation="left">
              {intl.get('hsgp.apiManage.view.message.editor.passiveRelyApi').d('被依赖的 API')}
            </Divider>
            <Table
              bordered
              columns={columns}
              scroll={{ x: tableScrollWidth(columns) }}
              dataSource={passiveRelyApiList}
              pagination={false}
            />
          </div>
        </Spin>
      </Modal>
    );
  }
}
