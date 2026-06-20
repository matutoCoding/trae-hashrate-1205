export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/loan/index',
    'pages/collection/index',
    'pages/mine/index',
    'pages/approval-detail/index',
    'pages/loan-detail/index',
    'pages/collection-detail/index',
    'pages/loan-create/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1a365d',
    navigationBarTitleText: '美术馆藏品外借',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f7f5f2'
  },
  tabBar: {
    color: '#718096',
    selectedColor: '#1a365d',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '审批中心'
      },
      {
        pagePath: 'pages/loan/index',
        text: '外借登记'
      },
      {
        pagePath: 'pages/collection/index',
        text: '藏品排期'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
