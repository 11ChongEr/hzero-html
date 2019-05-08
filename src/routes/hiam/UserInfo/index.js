/**
 * UserInfo.js
 * @date 2018/11/23
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';

import { Header, Content as PageContent } from 'components/Page';

import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import styles from './index.less';

import AccountInfo from './AccountInfo';
import SafeInfo from './SafeInfo';
import PreferenceInfo from './PreferenceInfo';
import UserReceiveConfig from './UserReceiveConfig';

@connect(({ userInfo, loading }) => ({
  userInfo,
  avatarLoading: loading.effects['userInfo/saveAvatar'],
  editModalLoading:
    loading.effects['userInfo/validatePrePassword'] ||
    loading.effects['userInfo/validatePreValidate'] ||
    loading.effects['userInfo/validateNewEmail'] ||
    loading.effects['userInfo/validateNewPhone'] ||
    loading.effects['userInfo/updatePassword'],
  postCaptchaLoading: loading.effects['userInfo/postCaptcha'],
  updateRoleLoading: loading.effects['userInfo/updateRole'],
  updateCompanyLoading: loading.effects['userInfo/updateCompany'],
  updateRealNameLoading: loading.effects['userInfo/updateRealName'],
  updateTimeZoneLoading: loading.effects['userInfo/updateTimeZone'],
  updateLanguageLoading: loading.effects['userInfo/updateLanguage'],
  updateDateFormatLoading: loading.effects['userInfo/updateDateFormat'],
  updateTimeFormatLoading: loading.effects['userInfo/updateTimeFormat'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hpfm.userInfo'] })
export default class UserInfo extends React.Component {
  componentDidMount() {
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'userInfo/init',
      payload: { organizationId },
    });
  }

  render() {
    const {
      dispatch,
      organizationId,
      userInfo: {
        userInfo,
        roleDataSource,
        companyDataSource,
        imgFormData, // 图片表单数据
        uploadImgName, // 图片名称
        uploadImgPreviewUrl, // 图片上传预览
        imgUploadStatus, // 图片上传状态
        modalProps = {}, // modalForm 的额外数据
        openAccountList = [], // 第三方应用
        languageMap = {}, // 语言
        dateMap = {}, // 日期格式
        timeMap = {}, // 时间格式
      },
      updateCompanyLoading = false,
      updateRoleLoading = false,
      updateRealNameLoading = false,
      avatarLoading = false,
      editModalLoading = false,
      updateTimeZoneLoading = false,
      updateLanguageLoading = false,
      updateDateFormatLoading = false,
      updateTimeFormatLoading = false,
      postCaptchaLoading = false,
      location: { state: { _back } = {} },
    } = this.props;
    return (
      <React.Fragment>
        <Header title={intl.get('hzero.common.title.userInfo').d('个人中心')} />
        <PageContent noCard className={styles['user-info-content']}>
          <Tabs
            animated={false}
            tabPosition="left"
            defaultActiveKey={isUndefined(_back) ? 'account' : 'safe'}
          >
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.accountInfo').d('帐号信息')}
              key="account"
            >
              <AccountInfo
                userInfo={userInfo}
                roleDataSource={roleDataSource}
                companyDataSource={companyDataSource}
                initRoleDataSource={this.initRoleDataSource}
                initCompanyDataSource={this.initCompanyDataSource}
                onSaveRealName={this.handleRealNameSave}
                updateRealNameLoading={updateRealNameLoading}
                onDefaultCompanySave={this.handleCompanySave}
                onDefaultRoleSave={this.handleRoleSave}
                updateRoleLoading={updateRoleLoading}
                updateCompanyLoading={updateCompanyLoading}
                // 头像
                getEnabledFile={this.getEnabledFile}
                imgFormData={imgFormData}
                uploadImgName={uploadImgName}
                uploadImgPreviewUrl={uploadImgPreviewUrl}
                imgUploadStatus={imgUploadStatus}
                avatarLoading={avatarLoading}
                organizationId={organizationId}
                dispatch={dispatch}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.safeSetting').d('安全设置')}
              key="safe"
            >
              <SafeInfo
                userInfo={userInfo}
                modalProps={modalProps}
                onPasswordUpdate={this.handlePasswordUpdate}
                dispatch={dispatch}
                openAccountList={openAccountList}
                editModalLoading={editModalLoading}
                postCaptchaLoading={postCaptchaLoading}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.preferenceSetting').d('偏好设置')}
              key="preference"
            >
              <PreferenceInfo
                userInfo={userInfo}
                onTimeZoneUpdate={this.handleTimeZoneUpdate}
                initLanguageMap={this.initLanguageMap}
                initDateMap={this.initDateMap}
                initTimeMap={this.initTimeMap}
                dateMap={dateMap}
                timeMap={timeMap}
                languageMap={languageMap}
                onTimeFormatUpdate={this.handleTimeFormatUpdate}
                onDateFormatUpdate={this.handleDateFormatUpdate}
                onLanguageUpdate={this.handleLanguageUpdate}
                updateTimeZoneLoading={updateTimeZoneLoading}
                updateLanguageLoading={updateLanguageLoading}
                updateDateFormatLoading={updateDateFormatLoading}
                updateTimeFormatLoading={updateTimeFormatLoading}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.receiveSetting').d('接收设置')}
              key="receive"
            >
              <UserReceiveConfig />
            </Tabs.TabPane>
          </Tabs>
        </PageContent>
      </React.Fragment>
    );
  }

  @Bind()
  initRoleDataSource() {
    const { dispatch } = this.props;
    // 获取当前登陆用户所拥有的角色
    dispatch({
      type: 'userInfo/initRoleDataSource',
    });
  }

  @Bind()
  initCompanyDataSource() {
    // 获取当前登陆用户所拥有的角色
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'userInfo/initCompanyDataSource',
      payload: { organizationId },
    });
  }

  @Bind()
  handleRealNameSave(realName) {
    const {
      dispatch,
      userInfo: { userInfo = {} },
    } = this.props;
    return dispatch({
      type: 'userInfo/updateRealName',
      payload: {
        realName,
        userInfo,
      },
    });
  }

  @Bind()
  handleCompanySave(defaultCompanyId) {
    const {
      userInfo: { companyMap = {}, userInfo = {} },
      dispatch,
      organizationId,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateCompany',
      payload: {
        defaultCompanyId,
        defaultCompanyName: companyMap[defaultCompanyId].companyName,
        userInfo,
        organizationId,
      },
    });
  }

  @Bind()
  handleRoleSave(defaultRoleId) {
    const {
      userInfo: { roleMap = {}, userInfo = {} },
      dispatch,
      organizationId,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateRole',
      payload: {
        defaultRoleId,
        defaultRoleName: roleMap[defaultRoleId].name,
        userInfo,
        organizationId,
      },
    });
  }

  @Bind()
  getEnabledFile() {
    const { dispatch, organizationId } = this.props;
    return dispatch({
      type: 'userInfo/fetchEnabledFile',
      payload: {
        tenantId: organizationId,
        bucketName: 'public',
      },
    });
  }

  // safe-info

  /**
   * 更新密码
   * @param {*} payload
   */
  @Bind()
  handlePasswordUpdate(payload) {
    const {
      dispatch,
      userInfo: { userInfo = {} },
    } = this.props;
    return dispatch({
      type: 'userInfo/updatePassword',
      payload: {
        userInfo,
        ...payload,
      },
    });
  }

  // preference-info

  @Bind()
  handleTimeZoneUpdate({ timeZone, timeZoneMeaning }) {
    const {
      dispatch,
      userInfo: { userInfo = {} },
    } = this.props;
    return dispatch({
      type: 'userInfo/updateTimeZone',
      payload: {
        timeZone,
        timeZoneMeaning,
        userInfo,
      },
    });
  }

  // todo 之前切换到输入模式都会查询，现在只会查询一次
  @Bind()
  initLanguageMap() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/initLanguageDataSource',
      payload: {},
    });
  }

  @Bind()
  handleLanguageUpdate(language) {
    const {
      userInfo: { languageMap = {}, userInfo },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateLanguage',
      payload: {
        language,
        languageName: languageMap[language].name,
        userInfo,
      },
    });
  }

  // todo 之前切换到输入模式都会查询，现在只会查询一次
  @Bind()
  initDateMap() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/initDateFormat',
      payload: {},
    });
  }

  // todo 之前切换到输入模式都会查询，现在只会查询一次
  @Bind()
  initTimeMap() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/initTimeFormat',
      payload: {},
    });
  }

  /**
   * 变更当前用户的默认时间格式
   * @param {String} dateFormat
   * @memberof UserInfo
   */
  @Bind()
  handleDateFormatUpdate(dateFormat) {
    const {
      userInfo: { dateMap = {}, userInfo = {} },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateDateFormat',
      payload: {
        dateFormat,
        dateFormatMeaning: dateMap[dateFormat].meaning,
        userInfo,
      },
    });
  }

  /**
   * 变更当前用户的默认语言
   * @param {Object} timeFormat
   * @memberof UserInfo
   */
  @Bind()
  handleTimeFormatUpdate(timeFormat) {
    const {
      userInfo: { timeMap = {}, userInfo = {} },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateTimeFormat',
      payload: {
        timeFormat,
        timeFormatMeaning: timeMap[timeFormat].meaning,
        userInfo,
      },
    });
  }
}
