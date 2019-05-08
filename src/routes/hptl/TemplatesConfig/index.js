import React from 'react';
import { Row, Col, Card, Icon, Switch, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import style from './index.less';

@connect(({ loading, group, templatesConfig }) => ({
  group,
  templatesConfig,
  fetchTemplateLoading: loading.effects['templatesConfig/fetchTemplatesConfigData'],
}))
@formatterCollections({
  code: ['hptl.common', 'entity.group', 'entity.company', 'entity.template'],
})
export default class TemplateConfig extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      companyId: '',
      companyName: '',
      organizationId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'group/fetchGroup',
      payload: { organizationId: this.state.organizationId },
    }).then(res => {
      if (res) {
        this.fetchTemplate({ groupId: res[0] && res[0].groupId, companyId: -1 });
      }
    });
  }

  fetchTemplate(params = {}) {
    const {
      dispatch,
      group: { groupData = [] },
    } = this.props;
    const { organizationId } = this.state;
    const { groupId } = groupData[0] || {};
    const { companyId = '' } = params;
    this.setState({ companyId });
    dispatch({
      type: 'templatesConfig/fetchTemplatesConfigData',
      payload: { groupId, organizationId, ...params },
    }).then(res => {
      if (res && res.assignId) {
        this.fetchTemplateList({ assignId: res.assignId });
      } else {
        dispatch({
          type: 'templatesConfig/updateState',
          payload: { templatesConfigList: [] },
        });
      }
    });
  }

  /**
   * @function 获取模板数据
   * @param {Object} params - 请求参数
   */
  fetchTemplateList(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'templatesConfig/fetchTemplateConfigList',
      payload: params,
    });
  }

  /**
   * @function handleEnabledTemplate - 设置
   * @param {string} data.configId - 配置ID
   */
  @Bind()
  handleEnabledTemplate(data) {
    const { dispatch } = this.props;
    const { companyId, organizationId } = this.state;
    dispatch({
      type: 'templatesConfig/enableTemplate',
      payload: { ...data, organizationId },
    }).then(() => {
      notification.success();
      this.fetchTemplate({ companyId });
    });
  }

  render() {
    const {
      fetchTemplateLoading,
      history,
      group: { groupData },
      templatesConfig: { templateConfigData, templatesConfigList = [] },
    } = this.props;
    const { webUrl, templateName } = templateConfigData;
    const { groupName, groupId } = groupData[0] || {};
    const { companyName } = this.state;
    return (
      <React.Fragment>
        <Header title="模板配置" />
        <Content>
          <table className={style['template-table']}>
            <tbody align="left">
              <tr>
                <td className={style['template-label']}>
                  {intl.get('entity.group.name').d('集团名称')}
                </td>
                <td>{groupName}</td>
                <td className={style['template-label']}>
                  {intl.get('entity.company.name').d('公司名称')}
                </td>
                <td>
                  <Lov
                    code="HPFM.COMPANY"
                    style={{ width: 250 }}
                    queryParams={{
                      tenantId: this.state.organizationId,
                      groupId,
                    }}
                    value={companyName}
                    onChange={(text, record) => {
                      this.setState({ companyName: record.companyName });
                      this.fetchTemplate({ companyId: record.companyId });
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className={style['template-label']}>
                  {intl.get('hptl.common.view.message.customDomain').d('个性化域名')}
                </td>
                <td>{webUrl && `${webUrl}.going-link.com`}</td>
                <td className={style['template-label']}>
                  {intl.get('hptl.common.view.message.customTemplate').d('所选模板')}
                </td>
                <td>{templateName}</td>
              </tr>
            </tbody>
          </table>
          <Spin spinning={fetchTemplateLoading}>
            <Row gutter={24}>
              {templatesConfigList.length > 0 ? (
                <div style={{ fontSize: '16px', padding: '24px 24px 0 12px' }}>
                  {intl.get('hptl.common.view.message.allTemplate').d('所有模板:')}&nbsp;
                </div>
              ) : (
                <div className={style['no-data']}>
                  {intl.get('hptl.common.view.message.noTemplate').d('暂未维护模板')}
                </div>
              )}
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
                                `/hptl/templates-config/edit/${item.configId}/${item.templateName}`
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
                              `/hptl/templates-config/edit/${item.configId}/${item.templateName}`
                            )
                          }
                        />,
                        <Switch
                          type="primary"
                          disabled={item.defaultFlag === 1}
                          checked={item.defaultFlag === 1}
                          onChange={() => this.handleEnabledTemplate(item)}
                        />,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <span>
                              {intl.get('entity.template.code').d('模板代码')}:&nbsp;
                              {item.templateCode}
                            </span>
                            <span>
                              {intl.get('entity.template.name').d('模板名称')}:&nbsp;
                              {item.templateName}
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
