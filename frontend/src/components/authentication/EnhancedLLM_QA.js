import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import SvgIcon from '@mui/material/SvgIcon';
import "./LLM.css";
import graphManager from "./GraphDataManager";
import segmentData from '../../assets/data/segment_similarity_with_paths.json';
import paintingToSeals from '../../assets/data/painting_to_seals.json';

// 初始化 Deepseek 客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '', // 从环境变量读取
  dangerouslyAllowBrowser: true,
});

function Send(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <path d="M27.6367 15.1132L1.19533 0.9765C0.812515 0.785094 0.347671 1.08587 0.402359 1.49603L2.45314 25.914C2.48048 26.2968 2.8633 26.5156 3.21876 26.3788L11.75 22.7968L16.4258 28.1015C16.7266 28.4296 17.2461 28.2929 17.3555 27.8827L19.5977 19.4882L27.6367 16.0976C28.0195 15.9062 28.0469 15.332 27.6367 15.1132ZM16.4258 25.5585L13.9649 21.1835L1.38673 1.76947L18.0664 18.996L16.4258 25.5585Z" fill="#FDFDFD" />
    </SvgIcon>
  );
}

const EnhancedLLM_QA = ({ targetPaintingId = "D011518", onGraphUpdate, selectedImageId, showSegments = false }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  
  // 切片和印章数据
  const [segments, setSegments] = useState([]);
  const [seals, setSeals] = useState([]);

  // 根据选中的图片ID提取切片和印章
  useEffect(() => {
    if (!showSegments || !selectedImageId) {
      // 如果不显示切片和印章，清空数据
      setSegments([]);
      setSeals([]);
      return;
    }

    extractSegments(selectedImageId);
    extractSeals(selectedImageId);
  }, [selectedImageId, showSegments]);

  const extractSegments = (imageId) => {
    console.log('🔍 开始查找切片, imageId:', imageId);
    
    // 现在JSON中所有key都使用下划线,直接查找即可
    const baseSegments = segmentData[imageId];

    if (!baseSegments) {
      console.log(`❌ 未找到切片数据: ${imageId}`);
      console.log('📋 可用的keys示例:', Object.keys(segmentData).slice(0, 10));
      setSegments([]);
      return;
    }

    // 提取所有切片路径
    const allSegmentPaths = Object.keys(baseSegments);
    
    console.log(`✅ 找到${allSegmentPaths.length}个切片路径`);

    // 转换为前端可用的路径
    const segmentList = allSegmentPaths
      .map(path => {
        const relativePath = path.replace(/\\/g, '/');
        return {
          path: `/assets/data/${relativePath}`,
          name: path.split('\\').pop()
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`🎯 找到${segmentList.length}个切片:`, segmentList.map(s => s.name));
    setSegments(segmentList);
  };

  const extractSeals = (imageId) => {
    // 将连字符统一转换为下划线
    // D001430-1 -> D001430_1
    const normalizedId = imageId.replace(/-/g, '_');
    
    // 提取基础ID (D001430_1 -> D001430)
    let baseId = normalizedId;
    if (normalizedId.includes('_')) {
      baseId = normalizedId.split('_')[0];
    }

    // 从painting_to_seals.json中查找印章数据
    const paintingData = paintingToSeals.find(
      item => item.painting_code === baseId
    );

    if (!paintingData || !paintingData.seals || paintingData.seals.length === 0) {
      console.log(`未找到印章数据: ${baseId}`);
      setSeals([]);
      return;
    }

    const sealList = paintingData.seals.map(seal => ({
      code: seal.seal_code,
      path: `/assets/data/${seal.seal_image}`,
      name: `印章 ${seal.seal_code}`
    }));

    console.log(`找到${sealList.length}个印章:`, sealList.map(s => s.code));
    setSeals(sealList);
  };

  // 构建问题映射的prompt (让AI理解问题并映射到标准模板)
  const buildMappingPrompt = (userQuestion) => {
    const currentGraph = graphManager.getCurrentGraph();
    
    // 当前图的上下文
    let contextInfo = `当前鉴定图中包含以下信息:\n`;
    
    const paintings = currentGraph.nodes.filter(n => n.category === 'P');
    if (paintings.length > 0) {
      contextInfo += `\n画作: ${paintings.map(p => `《${p.name}》`).join(', ')}`;
    }
    
    const seals = currentGraph.nodes.filter(n => n.category === 'S');
    if (seals.length > 0) {
      contextInfo += `\n印章: ${seals.map(s => `"${s.name}"`).join(', ')}`;
    }
    
    const authors = currentGraph.nodes.filter(n => n.category === 'A');
    if (authors.length > 0) {
      contextInfo += `\n作者: ${authors.map(a => a.name).join(', ')}`;
    }

    // 切片信息
    let sliceInfo = '';
    if (selectedSlices.length > 0) {
      sliceInfo = `\n已选中切片: ${selectedSlices.map(i => `切片${i + 1}`).join(', ')}`;
    }

    // 11个标准问题模板
    const templates = `
可用的标准问题模板:
1. 查找相似印章 - 例如: "与某个印章相似的其他印章有哪些?"
2. 查找使用指定印章的画作 - 例如: "哪些画作使用了某个印章?"
3. 查找印章的拥有者 - 例如: "某个印章的拥有者是谁?"
4. 查找相似画作 - 例如: "与某幅画作相似的其他画作有哪些?"
5. 查找画作的印章 - 例如: "某幅画作上有哪些印章?"
6. 查找画作的作者 - 例如: "某幅画作的作者是谁?"
7. 查找画作的文献 - 例如: "某幅画作有哪些文献记载?"
8. 查找作者的画作 - 例如: "某位作者画了哪些作品?"
9. 查找作者的印章 - 例如: "某位作者使用了哪些印章?"
10. 查找文献提到的画作 - 例如: "某个文献中提到了哪些画作?"
11. 查找文献提到的作者 - 例如: "某个文献中提到了哪些作者?"
`;

    const prompt = `${contextInfo}${sliceInfo}

${templates}

用户问题: ${userQuestion}

请分析用户问题,提取关键信息(画作名、印章名、作者名等),并说明这个问题应该映射到哪个标准模板。
请用以下格式回答:
问题类型: [标准模板编号]
关键实体: [提取的画作/印章/作者名称,用《》或""标注]
简要说明: [如何理解这个问题]
`;
    
    return prompt;
  };

  // 发送消息到AI (问题映射模式)
  const sendMessageToAI = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const userQuestion = message;
    setMessage(""); // 立即清空输入框

    try {
      console.log("📝 用户问题:", userQuestion);
      
      // 第1步: 让AI理解问题并映射到标准模板
      const mappingPrompt = buildMappingPrompt(userQuestion);
      
      const mappingCompletion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个专业的中国古代书画鉴定助手,擅长理解用户问题并映射到标准查询模板。" },
          { role: "user", content: mappingPrompt }
        ],
      });

      const aiMapping = mappingCompletion.choices[0]?.message?.content || "";
      console.log("🤖 AI问题映射:", aiMapping);

      // 第2步: 使用GraphDataManager从图中查询答案
      const queryResult = await queryGraphWithMapping(userQuestion, aiMapping);
      
      if (!queryResult) {
        setReply("未能从图中找到相关信息。");
        return;
      }

      // 第3步: 构建基于图查询结果的回答
      const finalAnswer = buildAnswerFromQueryResult(userQuestion, queryResult);
      
      console.log("✅ 最终答案:", finalAnswer);
      setReply(finalAnswer);

      // 清空切片选择
      setSelectedSlices([]);

    } catch (error) {
      console.error("❌ 处理问题失败:", error);
      setReply("处理失败,请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  // 使用AI映射结果从图中查询
  const queryGraphWithMapping = async (userQuestion, aiMapping) => {
    console.log('� 开始从图中查询...');
    
    try {
      // 使用GraphDataManager的processQuestion方法
      // 它会自动映射问题模板并从图中提取节点
      const newNodes = await graphManager.processQuestion(userQuestion, aiMapping);
      
      if (!newNodes || newNodes.length === 0) {
        console.log('ℹ️ 未找到匹配的节点');
        return null;
      }

      // 获取更新后的图
      const updatedGraph = graphManager.getCurrentGraph();
      
      // 通知父组件更新可视化
      if (onGraphUpdate) {
        onGraphUpdate(updatedGraph);
      }

      // 刷新历史记录显示
      if (window.refreshNestedList) {
        window.refreshNestedList();
      }

      console.log('✅ 查询完成, 新增节点数:', newNodes.length);
      
      return {
        newNodes: newNodes,
        currentGraph: updatedGraph
      };
    } catch (error) {
      console.error('❌ 查询图失败:', error);
      return null;
    }
  };

  // 根据图查询结果构建自然语言答案
  const buildAnswerFromQueryResult = (question, queryResult) => {
    const { newNodes } = queryResult;
    
    if (!newNodes || newNodes.length === 0) {
      return "未找到相关信息。";
    }

    // 按类型分组节点
    const paintings = newNodes.filter(n => n.category === 'P');
    const seals = newNodes.filter(n => n.category === 'S');
    const authors = newNodes.filter(n => n.category === 'A');
    const references = newNodes.filter(n => n.category === 'R');

    let answer = `根据图谱分析，为您找到以下信息：\n\n`;

    if (paintings.length > 0) {
      answer += `📖 画作 (${paintings.length}件):\n`;
      paintings.forEach((p, i) => {
        answer += `${i + 1}. 《${p.name}》\n`;
      });
      answer += '\n';
    }

    if (seals.length > 0) {
      answer += `🔴 印章 (${seals.length}枚):\n`;
      seals.forEach((s, i) => {
        answer += `${i + 1}. "${s.name}"\n`;
      });
      answer += '\n';
    }

    if (authors.length > 0) {
      answer += `👤 作者 (${authors.length}位):\n`;
      authors.forEach((a, i) => {
        answer += `${i + 1}. ${a.name}\n`;
      });
      answer += '\n';
    }

    if (references.length > 0) {
      answer += `📚 文献 (${references.length}条):\n`;
      references.forEach((r, i) => {
        answer += `${i + 1}. 《${r.name}》\n`;
      });
      answer += '\n';
    }

    answer += `\n💡 已将这些节点添加到知识图谱中，您可以在右侧图谱中查看它们的关系。`;

    return answer;
  };

  return (
    <div className="segments">
      {/* 切片和印章显示区 - 始终占据固定高度 */}
      <div className="segments-menu">
        {/* 左栏：切片 (75% - 约3:1比例) */}
        <div className="segments-menu1">
          {showSegments && segments.length > 0 ? (
            segments.map((segment, index) => (
              <div 
                key={index} 
                className="menu-image" 
                title={segment.name}
              >
                <img 
                  src={segment.path} 
                  alt={segment.name}
                />
              </div>
            ))
          ) : null}
        </div>

        {/* 右栏：印章 (25%) */}
        <div className="segments-menu2">
          {showSegments && seals.length > 0 ? (
            seals.map((seal, index) => (
              <div 
                key={index} 
                className="menu-image" 
                title={seal.name}
              >
                <img 
                  src={seal.path} 
                  alt={seal.name}
                />
              </div>
            ))
          ) : null}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="segments-input-container">
        <textarea
          className="segments-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="请输入您的问题..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessageToAI();
            }
          }}
        />
        <button 
          className="send-button"
          onClick={sendMessageToAI}
          disabled={loading}
          style={{ fontSize: 20 }}
        >
          {loading ? '...' : <Send sx={{ transform: 'scale(1.5) translateX(3px)' }} />}
        </button>
      </div>
    </div>
  );
};

export default EnhancedLLM_QA;
