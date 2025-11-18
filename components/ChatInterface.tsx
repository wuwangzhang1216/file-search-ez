/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Spinner from './Spinner';
import SendIcon from './icons/SendIcon';
import RefreshIcon from './icons/RefreshIcon';
import { motion, AnimatePresence } from 'framer-motion';
import ShimmerButton from './magicui/shimmer-button';
import AnimatedGradientText from './magicui/animated-gradient-text';
import BorderBeam from './magicui/border-beam';

interface ChatInterfaceProps {
    documentName: string;
    history: ChatMessage[];
    isQueryLoading: boolean;
    onSendMessage: (message: string) => void;
    onNewChat: () => void;
    exampleQuestions: string[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentName, history, isQueryLoading, onSendMessage, onNewChat, exampleQuestions }) => {
    const [query, setQuery] = useState('');
    const [currentSuggestion, setCurrentSuggestion] = useState('');
    const [modalContent, setModalContent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (exampleQuestions.length === 0) {
            setCurrentSuggestion('');
            return;
        }

        setCurrentSuggestion(exampleQuestions[0]);
        let suggestionIndex = 0;
        const intervalId = setInterval(() => {
            suggestionIndex = (suggestionIndex + 1) % exampleQuestions.length;
            setCurrentSuggestion(exampleQuestions[suggestionIndex]);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [exampleQuestions]);
    
    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let paraBuffer = '';

        function flushPara() {
            if (paraBuffer) {
                html += `<p class="my-2">${paraBuffer}</p>`;
                paraBuffer = '';
            }
        }

        function flushList() {
            if (listType) {
                html += `</${listType}>`;
                listType = null;
            }
        }

        for (const rawLine of lines) {
            const line = rawLine
                .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>')
                .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-gem-mist/50 px-1 py-0.5 rounded-sm font-mono text-sm">$1</code>');

            const isOl = line.match(/^\s*\d+\.\s(.*)/);
            const isUl = line.match(/^\s*[\*\-]\s(.*)/);

            if (isOl) {
                flushPara();
                if (listType !== 'ol') {
                    flushList();
                    html += '<ol class="list-decimal list-inside my-2 pl-5 space-y-1">';
                    listType = 'ol';
                }
                html += `<li>${isOl[1]}</li>`;
            } else if (isUl) {
                flushPara();
                if (listType !== 'ul') {
                    flushList();
                    html += '<ul class="list-disc list-inside my-2 pl-5 space-y-1">';
                    listType = 'ul';
                }
                html += `<li>${isUl[1]}</li>`;
            } else {
                flushList();
                if (line.trim() === '') {
                    flushPara();
                } else {
                    paraBuffer += (paraBuffer ? '<br/>' : '') + line;
                }
            }
        }

        flushPara();
        flushList();

        return { __html: html };
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSendMessage(query);
            setQuery('');
        }
    };

    const handleSourceClick = (text: string) => {
        setModalContent(text);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isQueryLoading]);

    return (
        <div className="flex flex-col h-full relative">
            <header className="absolute top-0 left-0 right-0 p-4 bg-gem-onyx/80 backdrop-blur-sm z-10 flex justify-between items-center border-b border-gem-mist">
                <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-4">
                    <AnimatedGradientText className="text-xl font-bold">
                        <span className="text-gem-offwhite truncate" title={`Chat with ${documentName}`}>
                            Chat with {documentName}
                        </span>
                    </AnimatedGradientText>
                    <ShimmerButton
                        onClick={onNewChat}
                        className="flex items-center flex-shrink-0"
                        shimmerColor="#60a5fa"
                        background="linear-gradient(to right, #2563eb, #3b82f6)"
                        shimmerSize="0.1em"
                    >
                        <RefreshIcon />
                        <span className="ml-2 hidden sm:inline">New Chat</span>
                    </ShimmerButton>
                </div>
            </header>

            <div className="flex-grow pt-24 pb-32 overflow-y-auto px-4">
                <div className="w-full max-w-4xl mx-auto space-y-6">
                    <AnimatePresence mode="popLayout">
                        {history.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`relative max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl ${
                                    message.role === 'user'
                                    ? 'bg-gradient-to-br from-gem-blue to-blue-600 text-white shadow-lg'
                                    : 'bg-gem-slate shadow-md'
                                }`}>
                                    {message.role === 'model' && <BorderBeam size={150} duration={12} delay={index * 2} />}
                                    <div dangerouslySetInnerHTML={renderMarkdown(message.parts[0].text)} />
                                    {message.role === 'model' && message.groundingChunks && message.groundingChunks.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gem-mist/50">
                                            <h4 className="text-xs font-semibold text-gem-offwhite/70 mb-2 text-right">Sources:</h4>
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {message.groundingChunks.map((chunk, chunkIndex) => (
                                                    chunk.retrievedContext?.text && (
                                                        <motion.button
                                                            key={chunkIndex}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleSourceClick(chunk.retrievedContext!.text!)}
                                                            className="bg-gem-mist/50 hover:bg-gem-mist text-xs px-3 py-1 rounded-md transition-colors"
                                                            aria-label={`View source ${chunkIndex + 1}`}
                                                            title="View source document chunk"
                                                        >
                                                            Source {chunkIndex + 1}
                                                        </motion.button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isQueryLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="relative max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl bg-gem-slate flex items-center shadow-md">
                                <BorderBeam size={150} duration={8} />
                                <Spinner />
                            </div>
                        </motion.div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gem-onyx/80 backdrop-blur-sm">
                 <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-2 min-h-[3rem] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!isQueryLoading && currentSuggestion && (
                                <motion.div
                                    key={currentSuggestion}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <button
                                        onClick={() => setQuery(currentSuggestion)}
                                        className="text-base text-gem-offwhite bg-gem-slate hover:bg-gem-mist transition-all duration-300 px-4 py-2 rounded-full hover:scale-105 shadow-md hover:shadow-lg"
                                        title="Use this suggestion as your prompt"
                                    >
                                        Try: "{currentSuggestion}"
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                     <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question about the manuals..."
                            className="flex-grow bg-gem-mist border border-gem-mist/50 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-gem-blue transition-all duration-300 shadow-sm focus:shadow-md"
                            disabled={isQueryLoading}
                        />
                        <motion.button
                            type="submit"
                            disabled={isQueryLoading || !query.trim()}
                            className="p-3 bg-gradient-to-br from-gem-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-full text-white disabled:bg-gem-mist disabled:from-gem-mist disabled:to-gem-mist transition-all duration-300 shadow-lg hover:shadow-xl"
                            title="Send message"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <SendIcon />
                        </motion.button>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {modalContent !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="source-modal-title"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-gem-slate p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <BorderBeam size={200} duration={15} />
                            <h3 id="source-modal-title" className="text-xl font-bold mb-4">Source Text</h3>
                            <div
                                className="flex-grow overflow-y-auto pr-4 text-gem-offwhite/80 border-t border-b border-gem-mist py-4"
                                dangerouslySetInnerHTML={renderMarkdown(modalContent || '')}
                            >
                            </div>
                            <div className="flex justify-end mt-6">
                                <ShimmerButton
                                    onClick={closeModal}
                                    className="px-6 py-2"
                                    shimmerColor="#60a5fa"
                                    background="linear-gradient(to right, #2563eb, #3b82f6)"
                                >
                                    Close
                                </ShimmerButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatInterface;
