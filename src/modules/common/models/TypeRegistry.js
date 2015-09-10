var TypeRegistry = require('../../../framework/model/TypeRegistry');
var registry = new TypeRegistry('TypeRegistry', 'TypeRegistry', 'TypeRegistry');

registry
    .item('UserRole', 'UserRole', '用户角色')
    .addChild('SystemManager','sm', '系统管理员')
    .addChild('RegularUser','ru', '普通用户')
    .addChild('CustomerServer','cs', '客服')
    .up().item('Case', 'Case', '标准化服务')
    .addChild('Coffee','co', '咖啡')
    .addChild('Taxi','tx', '用车')
    .up().item('CaseStatus', 'CaseStatus', '服务类型')
    .addChild('Draft','dr', '草稿')
    .addChild('Reviewing','re', '审核')
    .addChild('Applying','ap', '请求')
    .addChild('Undertaken','ut', '承接')
    .addChild('InService','is', '服务中')
    .addChild('Completed','cl', '已完成')
    .addChild('Cancelled','cc', '已取消')
    .up().item('MsgContent', 'MsgContent', '消息类型')
    .addChild('text','tx', '文本')
    .addChild('voice','vo', '语音')
    .addChild('image','pi', '图片')
    .addChild('video','vi', '视频')
    .addChild('shortvideo','sv', '小视频')
    .up().item('Party', 'Party', '方')
    .addChild('Org','og', '机构')
    .addChild('Person','pr', '个人')
    .up().item('ConversationState', 'ConversationState', '会话状态')
    .addChild('Start','st', '待处理')
    .addChild('Handing','hd', '进行中')
    .addChild('Finish','fn', '已结束')
    .up().item('CSState', 'CSState', '客服状态')
    .addChild('offline','off', '离线')
    .addChild('online','free', '空闲')
    .addChild('busy','busy', '忙碌')
    .addChild('case','case', '处理订单')


module.exports = registry;