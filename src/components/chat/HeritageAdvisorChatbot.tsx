import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sendChatMessage, ChatMessage } from '../../services/geminiChatService';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  MapPin, 
  Loader2, 
  HelpCircle, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Cpu, 
  ChevronRight, 
  Store 
} from 'lucide-react';

export const HeritageAdvisorChatbot: React.FC = () => {
  const { 
    isChatOpen, 
    closeChat, 
    openChatWithContext, 
    chatInitialPrompt, 
    chatCostumeContext 
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Kính chào bạn! Tôi là **Trợ Lý Cố Vấn Cổ Phục & Di Sản Việt Nam (Nếp AI Advisor)**.

Tôi sẵn sàng đồng hành và giải đáp cho bạn:
• **Đặc điểm & Điển chế:** Cấu trúc cổ lập lĩnh, tay raglan, 5 hạt cúc Ngũ Luân, ý nghĩa Ngũ Thường của Áo Dài, Áo Tứ Thân, Áo Ngũ Thân, Áo Tấc, Nhật Bình...
• **Gợi ý phối đồ Remix:** Tư vấn kết hợp cổ phục cùng thời trang đương đại hài hòa cho từng sự kiện hoặc đời sống thường nhật.
• **Bối cảnh di sản & Phong thái:** Gợi ý các danh thắng, hoàng thành, lăng tẩm, phố cổ phù hợp nhất với thần thái từng loại y phục.
• **Chất liệu & May đo:** Tư vấn các dòng lụa tơ tằm, gấm sa đoạn, vân mây và cách giữ gìn phom dáng cổ phục.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      places: [
        {
          name: 'Hoàng Thành Thăng Long',
          category: 'Không Gian Di Sản',
          address: '19C Hoàng Diệu, Điện Biên, Ba Đình, Hà Nội',
          city: 'Hà Nội',
          tip: 'Đoan Môn và Kỳ Đài cổ kính hàng ngàn năm, rất hợp với vẻ tôn nghiêm của Áo Tấc và Áo Ngũ Thân.'
        },
        {
          name: 'Đại Nội Huế & Tử Cấm Thành',
          category: 'Không Gian Di Sản',
          address: 'Đường 23 Tháng 8, Phường Thuận Hòa, TP. Huế',
          city: 'Thừa Thiên Huế',
          tip: 'Trường Lang và Cung Diên Thọ sơn son thếp vàng là bối cảnh vàng tôn vinh Áo Nhật Bình cung đình.'
        }
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isChatOpen, messages]);

  // Handle auto-injected prompt from other components
  useEffect(() => {
    if (chatInitialPrompt && isChatOpen) {
      handleSendMessage(chatInitialPrompt);
    }
  }, [chatInitialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        newHistory.map((m) => ({ role: m.role, content: m.content })),
        selectedModel,
        chatCostumeContext
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        places: response.places,
        sources: response.sources,
        modelUsed: response.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: 'Rất tiếc, đã có trục trặc trong quá trình kết nối cố vấn di sản. Xin bạn vui lòng thử lại sau giây lát.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: `Cuộc trò chuyện đã được làm mới. Tôi là Nếp AI, luôn sẵn sàng đồng hành cùng bạn tìm hiểu về cổ phục Việt Nam, điển chế hoa văn và cách phối đồ đương đại.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const quickPrompts = [
    'Gợi ý bối cảnh chụp ảnh tôn dáng Áo Tấc & Nhật Bình?',
    'Ý nghĩa của 5 cúc khuy và năm thân trong Áo Ngũ Thân nam?',
    'Gợi ý cách phối Áo Dài nữ cùng blazer hiện đại đi tiệc?',
    'Chất liệu lụa tơ tằm và gấm sa đoạn trong may cổ phục?',
    'Phân biệt cổ lập lĩnh và giao lĩnh trong trang phục triều Nguyễn?'
  ];

  return (
    <>
      {/* Floating Launcher Button (Hidden on mobile <768px; positioned at bottom-6 right-6 on md/lg) */}
      {!isChatOpen && (
        <button
          onClick={() => openChatWithContext()}
          className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#800E13] to-[#9B2226] hover:from-[#640D14] hover:to-[#800E13] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group"
          title="Trò chuyện cùng Trợ lý Cố Vấn Cổ Phục"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E9C46A] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E9C46A] rounded-full" />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            Hỏi Cố Vấn Cổ Phục
          </span>
          <Sparkles className="w-4 h-4 text-[#E9C46A] animate-pulse" />
        </button>
      )}

      {/* Chat Window Modal / Drawer */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div 
            className={`flex flex-col bg-[#FFFDF9] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E7DAC8] overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'w-full h-full sm:w-[92vw] sm:h-[90vh] sm:max-w-5xl' 
                : 'w-full h-[85vh] sm:h-[680px] sm:w-[500px] sm:max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#800E13] to-[#640D14] text-white border-b border-[#9B2226]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-[#E9C46A]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
                    <span>Nếp Cố Vấn Di Sản</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#E9C46A] text-[#2C241D] font-mono uppercase font-bold">
                      Trợ lý AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#F3EADB] opacity-90">
                    Cố vấn cổ phục, phối đồ & điển chế văn hóa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                {/* Reset button */}
                <button
                  onClick={handleResetChat}
                  title="Làm mới hội thoại"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Expand / Minimize button (Desktop only) */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
                  className="hidden sm:block p-1.5 hover:bg-white/10 rounded-lg transition-colors hover:text-white"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close button */}
                <button
                  onClick={closeChat}
                  title="Đóng cửa sổ"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors hover:text-white ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mode Selector Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#F3EADB] border-b border-[#E2D2BE] text-xs text-[#55473D]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#800E13]" />
                <span className="font-medium text-[11px]">Chế độ tham vấn:</span>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="text-[11px] font-medium bg-white/80 border border-[#DFD1BD] rounded-lg px-2 py-1 text-[#2C241D] focus:outline-none focus:ring-1 focus:ring-[#800E13]"
              >
                <option value="gemini-3.8-flash">Tiêu chuẩn Flagship (Gemini 3.8 Flash)</option>
                <option value="gemini-3.1-flash-lite">Siêu tốc (Phản hồi tức thì)</option>
                <option value="gemini-3.1-pro-preview">Chuyên sâu (Khảo cứu sử liệu chi tiết)</option>
              </select>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF5EE]/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#800E13] text-white rounded-tr-none'
                        : 'bg-white text-[#2C241D] border border-[#E7DAC8] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.role === 'user' ? 'text-white/70' : 'text-[#8C7A6B]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Informational Heritage Locations / Places */}
                  {msg.places && msg.places.length > 0 && (
                    <div className="mt-2.5 w-full max-w-[90%] space-y-2">
                      <p className="text-[11px] font-bold text-[#800E13] flex items-center gap-1 px-1">
                        <Store className="w-3.5 h-3.5" />
                        <span>Không gian di sản & địa chỉ tham khảo:</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.places.map((place, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[#FAF5EE] rounded-xl border border-[#E4D7C5] hover:border-[#800E13]/50 transition-all shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-block px-2 py-0.5 bg-[#800E13]/10 text-[#800E13] text-[10px] font-bold rounded-md mb-1">
                                  {place.category}
                                </span>
                                <h4 className="font-bold text-xs sm:text-sm text-[#2C241D]">
                                  {place.name}
                                </h4>
                              </div>
                            </div>

                            <p className="mt-1.5 text-[11px] text-[#6C584C] flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-[#9B2226] shrink-0 mt-0.5" />
                              <span>{place.address}</span>
                            </p>

                            {place.tip && (
                              <p className="mt-1.5 text-[11px] text-[#55473D] italic bg-white/70 p-2 rounded-lg border border-[#EDE4D5]">
                                💡 {place.tip}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources if present */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1.5 px-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-[#8C7A6B]">Nguồn tham khảo:</span>
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#800E13] hover:underline bg-[#EFE7DC] px-2 py-0.5 rounded-md"
                        >
                          {src.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white border border-[#E7DAC8] max-w-[75%] shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#800E13] animate-pulse" />
                    <span className="text-xs font-medium text-[#2C241D]">Trợ lý Di sản đang tra cứu...</span>
                  </div>
                  <div className="h-1 w-full bg-[#EFE6D8] rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-[#800E13] to-[#C5A880] w-1/2 rounded-full animate-shimmer" />
                  </div>
                  <p className="text-[11px] text-[#786454]">
                    Đang tổng hợp kiến thức lịch sử, điển chế hoa văn & phối thức hiện đại
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 bg-[#FAF5EE] border-t border-[#E7DAC8] overflow-x-auto">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[10px] font-semibold text-[#8C7A6B] flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-[#800E13]" />
                  Gợi ý:
                </span>
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="px-2.5 py-1 bg-white hover:bg-[#F3EADB] text-[#55473D] text-[11px] rounded-lg border border-[#DFD1BD] transition-colors shrink-0"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#E7DAC8]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Hỏi về kết cấu trang phục, cách phối đồ, lịch sử di sản..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-[#FAF5EE] border border-[#DFD1BD] rounded-2xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/20 focus:border-[#800E13] transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-3 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-2xl disabled:opacity-40 transition-colors shadow-md shadow-[#800E13]/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
