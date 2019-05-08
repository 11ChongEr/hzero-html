/**
 * Config - 系统配置
 * @date: 2018-10-24
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Form, Button, Input, Row, Col, Spin, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Upload from 'components/Upload/UploadButton';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ config, loading, user }) => ({
  config,
  user,
  queryTenantConfigLoading: loading.effects['config/queryTenantConfig'],
  queryOrganizationConfigLoading: loading.effects['config/queryOrganizationConfig'],
  updateTenantConfigLoading: loading.effects['config/updateTenantConfig'],
  updateOrganizationConfigLoading: loading.effects['config/updateOrganizationConfig'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hpfm.config'],
})
@Form.create({ fieldNameProp: null })
@withRouter
export default class ConfigDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      form: { getFieldDecorator },
      config: {
        data = [],
        lov: { menuLayout: lovMenuLayout = [], menuLayoutTheme: lovMenuLayoutTheme = [] },
      },
      queryTenantConfigLoading,
      queryOrganizationConfigLoading,
      updateTenantConfigLoading,
      updateOrganizationConfigLoading,
      isSite,
    } = this.props;
    let iconFileList = [];
    let faviconFileList = [];
    if (data.length > 0) {
      data.forEach(item => {
        switch (item.configCode) {
          case 'LOGO':
            iconFileList = [
              {
                uid: '-1',
                name: item.fileName,
                status: 'done',
                url: item.configValue,
              },
            ];
            break;
          case 'FAVICON':
            faviconFileList = [
              {
                uid: '-1',
                name: item.fileName,
                status: 'done',
                url: item.configValue,
              },
            ];
            break;
        }
      });
    }
    const title = this.findConfigField('TITLE', data);
    const logo = this.findConfigField('LOGO', data);
    const favicon = this.findConfigField('FAVICON', data);
    const menuLayout = this.findConfigField('MENU_LAYOUT', data);
    const menuLayoutTheme = this.findConfigField('MENU_LAYOUT_THEME', data);
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.config.view.message.title').d('系统配置')}>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            loading={isSite ? updateTenantConfigLoading : updateOrganizationConfigLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Spin spinning={isSite ? queryTenantConfigLoading : queryOrganizationConfigLoading}>
          <Content>
            <Form>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hpfm.config.model.config.title').d('系统标题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('title', {
                      initialValue: title,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.config.model.config.title').d('系统标题'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hpfm.config.model.config.logo').d('LOGO')}
                    extra={intl
                      .get('hpfm.config.model.config.uploadSupport', {
                        type: '*.png;*.jpeg',
                      })
                      .d('上传格式：*.png;*.jpeg')}
                    {...formLayout}
                    required
                  >
                    <Upload
                      accept=".jpeg,.png"
                      fileType="image/jpeg,image/png"
                      single
                      bucketName="public"
                      onUploadSuccess={this.onUploadSuccess}
                      fileList={iconFileList}
                      onRemove={this.onCancelSuccess}
                    />
                  </FormItem>
                  <FormItem wrapperCol={{ span: 15, offset: 7 }}>
                    {getFieldDecorator('logo', {
                      initialValue: logo,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.config.model.config.logo').d('LOGO'),
                          }),
                        },
                      ],
                    })(<div />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <FormItem
                    required
                    label={intl.get('hpfm.config.model.config.favicon').d('favicon')}
                    extra={intl
                      .get('hpfm.config.model.config.uploadSupport', {
                        type: '*.png;*.ico',
                      })
                      .d('上传格式：*.png;*.ico')}
                    {...formLayout}
                  >
                    <Upload
                      single
                      accept=".png,.ico"
                      fileType="image/png,image/icon"
                      bucketName="public"
                      onUploadSuccess={this.handleFaviconUploadSuccess}
                      fileList={faviconFileList}
                      onRemove={this.handleCancelFaviconUploadSuccess}
                    />
                  </FormItem>
                  <FormItem wrapperCol={{ span: 15, offset: 7 }}>
                    {getFieldDecorator('favicon', {
                      initialValue: favicon,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.config.model.config.favicon').d('favicon'),
                          }),
                        },
                      ],
                    })(<div />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hpfn.config.model.config.menuLayout').d('菜单布局')}
                    {...formLayout}
                  >
                    {getFieldDecorator('menuLayout', {
                      initialValue: menuLayout,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.config.model.config.menuLayout').d('菜单布局'),
                          }),
                        },
                      ],
                    })(
                      <Select>
                        {lovMenuLayout.map(item => {
                          return (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hpfn.config.model.config.menuLayoutTheme').d('菜单布局主题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('menuLayoutTheme', {
                      initialValue: menuLayoutTheme,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hpfm.config.model.config.menuLayoutTheme')
                              .d('菜单布局主题'),
                          }),
                        },
                      ],
                    })(
                      <Select>
                        {lovMenuLayoutTheme.map(item => {
                          return (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Content>
        </Spin>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.queryConfig();
    this.init();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'config/updateState',
      payload: {
        data: [],
      },
    });
  }

  /**
   * 查询系统配置信息
   */
  @Bind()
  queryConfig() {
    const { dispatch, organizationId, isSite } = this.props;
    dispatch({
      type: isSite ? 'config/queryTenantConfig' : 'config/queryOrganizationConfig',
      payload: organizationId,
    });
  }

  @Bind()
  handleSave() {
    const {
      form,
      dispatch,
      config: { data = [] },
      organizationId,
      isSite,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let values = [];
      const titleData = {
        category: 'system',
        configCode: 'TITLE',
        configValue: fieldsValue.title,
        tenantId: organizationId,
      };
      const logoData = {
        category: 'system',
        configCode: 'LOGO',
        configValue: fieldsValue.logo,
        tenantId: organizationId,
      };
      const faviconData = {
        category: 'system',
        configCode: 'FAVICON',
        configValue: fieldsValue.favicon,
        tenantId: organizationId,
      };
      const menuLayoutData = {
        category: 'system',
        configCode: 'MENU_LAYOUT',
        configValue: fieldsValue.menuLayout,
        tenantId: organizationId,
      };
      const menuLayoutThemeData = {
        category: 'system',
        configCode: 'MENU_LAYOUT_THEME',
        configValue: fieldsValue.menuLayoutTheme,
        tenantId: organizationId,
      };
      // values 的顺序不能改变
      values = [titleData, logoData, faviconData, menuLayoutData, menuLayoutThemeData];
      if (data.length > 0) {
        // 复制更新数据
        data.forEach(item => {
          switch (item.configCode) {
            case 'TITLE':
              values[0] = {
                ...item,
                configValue: fieldsValue.title,
              };
              break;
            case 'LOGO':
              values[1] = {
                ...item,
                configValue: fieldsValue.logo,
              };
              break;
            case 'FAVICON':
              values[2] = {
                ...item,
                configValue: fieldsValue.favicon,
              };
              break;
            case 'MENU_LAYOUT':
              values[3] = {
                ...item,
                configValue: fieldsValue.menuLayout,
              };
              break;
            case 'MENU_LAYOUT_THEME':
              values[4] = {
                ...item,
                configValue: fieldsValue.menuLayoutTheme,
              };
              break;
            default:
              break;
          }
        });
      }
      dispatch({
        type: isSite ? 'config/updateTenantConfig' : 'config/updateOrganizationConfig',
        payload: { values, organizationId },
      }).then(res => {
        if (res) {
          notification.success();
          this.queryConfig();
          if (res.length > 0) {
            const title = res.filter(item => item.configCode === 'TITLE');
            const logo = res.filter(item => item.configCode === 'LOGO');
            const favicon = res.filter(item => item.configCode === 'FAVICON');
            const menuLayout = res.filter(item => item.configCode === 'MENU_LAYOUT');
            const menuLayoutTheme = res.filter(item => item.configCode === 'MENU_LAYOUT_THEME');
            let newTitle = {};
            let newLogo = {};
            let newFavicon = {};
            let newMenuLayout = {};
            let newMenuLayoutTheme = {};
            title.forEach(element => {
              newTitle = { ...newTitle, ...element };
            });
            logo.forEach(element => {
              newLogo = { ...newLogo, ...element };
            });
            favicon.forEach(element => {
              newFavicon = { ...newFavicon, ...element };
            });
            menuLayout.forEach(element => {
              newMenuLayout = {
                ...newMenuLayout,
                ...element,
              };
            });
            menuLayoutTheme.forEach(element => {
              newMenuLayoutTheme = {
                ...newMenuLayoutTheme,
                ...element,
              };
            });
            dispatch({
              type: 'user/updateCurrentUser',
              payload: {
                title: newTitle.configValue,
                logo: newLogo.configValue,
                favicon: newFavicon.configValue,
                menuLayout: newMenuLayout.configValue,
                menuLayoutTheme: newMenuLayoutTheme.configValue,
              },
            });
          }
        }
      });
    });
  }

  /**
   * 从配置列表查找配置项
   * @param {Number|String} field 查询配置字段的 ID 或 Code
   * @param {Array} data 获取到的原配置数组
   */
  @Bind()
  findConfigField(field, data) {
    if (data.length > 0) {
      const dataFilter = data.find(item => {
        return item.configCode === field;
      });
      return dataFilter ? dataFilter.configValue : null;
    }
  }

  // 上传图片成功
  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        logo: file.response,
      });
    }
  }

  // 删除图片成功
  @Bind()
  onCancelSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        logo: '',
      });
    }
  }

  /**
   * 上传 favicon 成功
   */
  @Bind()
  handleFaviconUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        favicon: file.response,
      });
    }
  }

  /**
   * 删除 favicon 成功
   */
  @Bind()
  handleCancelFaviconUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        favicon: '',
      });
    }
  }

  /**
   * 页面初始化， 调用 model 中的初始化 查询值集
   */
  init() {
    const { dispatch } = this.props;
    dispatch({ type: 'config/init' });
  }
}
