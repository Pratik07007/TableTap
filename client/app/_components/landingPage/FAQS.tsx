"use client"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

import { useState } from "react";

type FAQItem = {
    question: string;
    answer: string;
}

export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            question: "How does the QR Dine-In feature help my restaurant?",
            answer: "It speeds up table turnover by allowing customers to order immediately without waiting for a server. It also increases average order value as customers can easily browse the full menu with visuals."
        },
        {
            question: "Can I track sales and orders in real-time?",
            answer: "Yes. The Admin Dashboard provides live updates on every order placed, table status, and total revenue collected, giving you full control over your floor."
        },
        {
            question: "How does the group billing/split payment work?",
            answer: "Our system allows multiple people at the same table to scan the same QR code. They can order individually and pay their own share, or one person can pay for the whole table. The system tracks it all automatically."
        },
        {
            question: "What hardware do I need to run TableTap?",
            answer: "No proprietary hardware is required. You can access the Owner Portal on any laptop, tablet, or smartphone. Customers use their own smartphones to order."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 bg-gray-50 scroll-mt-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HelpCircle size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-500">Common questions from Restaurant Owners.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                            >
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-orange-600" size={20} />
                                ) : (
                                    <ChevronDown className="text-gray-400" size={20} />
                                )}
                            </button>
                            <div
                                className={`px-6 text-gray-500 text-sm leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};