import React from 'react';
import { Row, Col, Icon, Card, Switch, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { HZERO_PTL } from 'utils/config';

import style from '../index.less';

@connect(({ loading, portalAssign }) => ({
  portalAssign,
  fetchTemplateLoading: loading.effects['portalAssign/fetchTemplatesConfigData'],
}))
export default class Template extends React.PureComponent {
  componentDidMount() {
    this.fetchTemplate();
  }

  fetchTemplate(params = {}) {
    const {
      dispatch,
      match: {
        params: { companyId, groupId },
      },
    } = this.props;
    dispatch({
      type: 'portalAssign/fetchTemplatesConfigData',
      payload: { ...params, companyId, groupId },
    }).then(res => {
      if (res && res.assignId) {
        dispatch({
          type: 'portalAssign/fetchTemplateConfigList',
          payload: {
            assignId: res.assignId,
          },
        });
      }
    });
  }

  /**
   * @function handleEnabledTemplate - 设置模板启用
   * @param {Object} data - 模板参数
   */
  @Bind()
  handleEnabledTemplate(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'portalAssign/enableTemplate',
      payload: data,
    }).then(() => {
      notification.success();
      this.fetchTemplate();
    });
  }

  render() {
    const {
      history,
      fetchTemplateLoading,
      match: {
        params: { companyId, groupId },
      },
      portalAssign: { templateConfigData, templatesConfigList = [] },
    } = this.props;
    const { groupName, companyName, webUrl, templateName } = templateConfigData;
    return (
      <React.Fragment>
        <Header title="门户模板定义" backPath={`${HZERO_PTL}/portal-assign/list`} />
        <Content>
          <table className={style['template-table']}>
            <tbody>
              <tr>
                <td className={style['template-label']}>
                  {intl.get('enitty.group.name').d('集团名称')}
                </td>
                <td>{groupName}</td>
                <td className={style['template-label']}>
                  {intl.get('entity.company.name').d('公司名称')}
                </td>
                <td>{companyName}</td>
              </tr>
              <tr>
                <td className={style['template-label']}>
                  {intl.get('hptl.common.view.message.title.customDomain').d('个性化域名')}
                </td>
                <td>{webUrl && `${webUrl}.going-link.com`}</td>
                <td className={style['template-label']}>
                  {intl.get('hptl.common.view.message.title.customTemplate').d('所选模板')}
                </td>
                <td>{templateName}</td>
              </tr>
            </tbody>
          </table>
          <Spin spinning={fetchTemplateLoading}>
            <Row gutter={24}>
              <div style={{ fontSize: '16px', padding: '24px 24px 0 12px' }}>
                {intl.get('hptl.common.view.message.title.allTemplate').d('所有模板:')}
              </div>
              {templatesConfigList.map(item => {
                return (
                  <Col key={item.templateId} span={8} style={{ marginTop: 20 }}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ height: 300, overflow: 'hidden' }}>
                          <img
                            src={item.templateAvatar}
                            alt="logo"
                            width="100%"
                            onClick={() =>
                              history.push(
                                `/hptl/portal-assign/template/edit/${companyId}/${
                                  item.configId
                                }/${groupId}/${item.templateName}`
                              )
                            }
                          />
                        </div>
                      }
                      actions={[
                        <Icon
                          type="setting"
                          onClick={() =>
                            history.push(
                              `/hptl/portal-assign/template/edit/${companyId}/${
                                item.configId
                              }/${groupId}/${item.templateName}`
                            )
                          }
                        />,
                        <Switch
                          type="primary"
                          disabled={item.defaultFlag === 1}
                          checked={item.defaultFlag === 1}
                          onClick={() => this.handleEnabledTemplate(item)}
                        />,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <span>
                              {intl
                                .get('hptl.common.view.message.title.templateCode')
                                .d('模板代码:')}
                              &nbsp;{item.templateCode}
                            </span>
                            <span>
                              {intl
                                .get('hptl.common.view.message.title.templateName')
                                .d('模板名称:')}
                              &nbsp;{item.templateName}
                            </span>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
