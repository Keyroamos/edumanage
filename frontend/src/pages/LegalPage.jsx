import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { Shield, Lock, FileText, Cookie } from 'lucide-react';

const legalContent = {
    privacy: {
        title: "Privacy Policy",
        icon: Shield,
        updated: "January 14, 2026",
        content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>At EduManage, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website directly or use our mobile application.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">1. Collection of Data</h3>
                <p>We collect information that you strictly provide to us. We collect the following personal information: Name, Email address, Phone number, and School information. We also collect data related to your usage of our platform to improve our services.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">2. Use of Data</h3>
                <p>We use the data we collect to operate and maintain our services, improve your experience, and communicate with you about updates and support. We strictly do not sell your personal data to third parties.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">3. Data Retention</h3>
                <p>We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your data to the extent necessary to comply with our legal obligations.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">4. Data Security</h3>
                <p>Your data security is important to us. We use commercially acceptable means to protect your Personal Data, including encryption and secure server infrastructure.</p>
            </div>
        )
    },
    terms: {
        title: "Terms of Service",
        icon: FileText,
        updated: "January 10, 2026",
        content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the EduManage website and mobile application operated by EduManage Inc.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">1. Conditions of Use</h3>
                <p>By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to stop using the website accordingly.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">2. Intellectual Property</h3>
                <p>You agree that all materials, products, and services provided on this website are the property of EduManage, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">3. User Accounts</h3>
                <p>As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">4. Applicable Law</h3>
                <p>By visiting this website, you agree that the laws of Kenya, without regard to principles of conflict laws, will govern these terms and conditions, or any dispute of any sort that might come between EduManage and you.</p>
            </div>
        )
    },
    cookies: {
        title: "Cookie Policy",
        icon: Cookie,
        updated: "December 20, 2025",
        content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>This Cookie Policy explains what cookies are and how we use them. You should read this policy so you can understand what type of cookies we use, or the information we collect using cookies and how that information is used.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">1. What are cookies?</h3>
                <p>Cookies are small text files that are sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">2. How we use cookies</h3>
                <p>When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes: to enable certain functions of the Service, to provide analytics, to store your preferences, and to enable advertisements delivery.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">3. Your choices regarding cookies</h3>
                <p>If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer.</p>
            </div>
        )
    },
    security: {
        title: "Security",
        icon: Lock,
        updated: "February 1, 2026",
        content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>Security is at the core of our business. We work tirelessly to ensure the confidentiality, integrity, and availability of your data.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">1. Infrastructure Security</h3>
                <p>Our application is hosted on secure, world-class cloud infrastructure providers that maintain industry-standard security certifications (ISO 27001, SOC 2). We utilize firewalls, intrusion detection systems, and regular vulnerability scanning.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">2. Data Encryption</h3>
                <p>All data transmitted between your browser and our servers is encrypted using 256-bit TLS/SSL (Transport Layer Security). Data at rest in our databases is also encrypted using industry-standard encryption algorithms.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">3. Access Control</h3>
                <p>We implement strict role-based access control (RBAC) within our organization. Only authorized personnel have access to production systems, and all access is logged and monitored.</p>

                <h3 className="text-xl font-bold text-slate-900 mt-8">4. Backups</h3>
                <p>We perform automated daily backups of all data. These backups are encrypted and stored in multiple geographic locations to ensure data durability and disaster recovery capabilities.</p>
            </div>
        )
    }
};

const LegalPage = () => {
    const { type } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    if (!legalContent[type]) {
        return <Navigate to="/" replace />;
    }

    const { title, icon: Icon, updated, content } = legalContent[type];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PublicNavbar />

            <main className="pt-20 pb-24">
                {/* Hero Header */}
                <div className="bg-slate-900 text-white py-20 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                            <Icon size={32} className="text-blue-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
                            {title}
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Last updated: {updated}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                        {content}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

export default LegalPage;
