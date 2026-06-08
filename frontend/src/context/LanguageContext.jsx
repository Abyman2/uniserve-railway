import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Portal / Chooser
    welcome_title: "Welcome to UniServe",
    welcome_subtitle: "Your all-in-one student services and announcement hub.",
    choose_language: "Select Language / ቋንቋ ይምረጡ",
    choose_role_title: "Choose Your Portal",
    student_portal: "Student Portal",
    admin_portal: "Administrator Portal",
    student_desc: "Browse services, book peers, apply as provider, or check news.",
    admin_desc: "Approve provider applications and publish campus news.",
    student_role_title: "Select Student Perspective",
    customer_role: "I want to Find & Book Services",
    customer_desc: "Hire other students for tasks, tutoring, laundry, and more.",
    provider_role: "I want to Offer Services",
    provider_desc: "Create listings, manage booking requests, and earn income.",
    back_button: "Back",
    continue: "Continue",

    // Navbar
    nav_home: "Home",
    nav_services: "Services",
    nav_news: "News",
    nav_about: "About Us",
    nav_dashboard: "Dashboard",
    nav_login: "Login",
    nav_register: "Register",
    nav_logout: "Logout",
    nav_provider_app: "Apply as Provider",

    // Hero
    hero_title: "Campus Services, Simplified.",
    hero_subtitle: "Find trustworthy peer-to-peer student services or offer your own skills to earn on campus.",
    search_placeholder: "Search for services (e.g. Tutoring, Laundry, Delivery)...",
    search_button: "Search",
    filter_all: "All Categories",
    category_tutoring: "Tutoring & Tech",
    category_laundry: "Laundry & Cleaning",
    category_delivery: "Delivery & Errands",
    category_creative: "Creative & Design",
    campus_filter_placeholder: "Select Campus...",

    // About Us
    about_title: "About UniServe",
    about_desc1: "UniServe is an enterprise-grade peer-to-peer marketplace built specifically for students. We connect students who need services with skilled student providers on campus.",
    about_desc2: "Our mission is to foster student employment, simplify campus living, and create a trusted network for micro-services. Security, ease of use, and local convenience are our top priorities.",
    about_feature_trust: "Trusted Network",
    about_feature_trust_desc: "Secure transactions and verified peer reviews ensure a safe campus environment.",
    about_feature_earn: "Earn on Campus",
    about_feature_earn_desc: "Turn your skills—from tutoring to laundry—into a flexible, rewarding job.",
    about_feature_news: "Campus News",
    about_feature_news_desc: "Stay informed with official announcements posted directly by administrators.",

    // Auth
    login_title: "Login to UniServe",
    login_btn: "Login",
    login_switch: "Don't have an account? Register here",
    register_title: "Create Student Account",
    register_btn: "Register",
    register_switch: "Already have an account? Login here",
    field_fullname: "Full Name",
    field_email: "Email Address",
    field_password: "Password",
    field_role: "Initial Role (Customer by default)",

    // Listings
    listings_title: "Available Campus Services",
    no_listings: "No services found matching your criteria.",
    price: "Price",
    campus: "Campus",
    provider: "Provider",
    book_now: "Book Now",
    create_listing_btn: "Create Service Listing",
    listing_title_field: "Service Title",
    listing_desc_field: "Service Description",
    listing_price_field: "Price (ETB)",
    listing_category_field: "Category",
    listing_campus_field: "Campus Location",
    submit_listing: "Publish Service",

    // Bookings / Dashboard
    customer_db_title: "Student Customer Dashboard",
    provider_db_title: "Service Provider Dashboard",
    admin_db_title: "Administrator Dashboard",
    my_bookings: "My Bookings",
    booking_id: "Booking ID",
    booking_status: "Status",
    booking_date: "Requested on",
    booking_actions: "Actions",
    no_bookings: "You have no bookings recorded.",
    status_pending: "PENDING",
    status_accepted: "ACCEPTED",
    status_completed: "COMPLETED",
    status_cancelled: "CANCELLED",
    status_rejected: "REJECTED",
    action_accept: "Accept",
    action_reject: "Reject",
    action_complete: "Complete",
    action_cancel: "Cancel",

    // Reviews
    leave_review: "Write a Review",
    rating: "Rating",
    comment: "Comment / Feedback",
    submit_review: "Submit Review",
    reviews_title: "Customer Reviews",
    no_reviews: "No reviews yet for this provider.",

    // News
    latest_news: "Latest Campus Announcements",
    no_news: "No announcements posted yet.",
    news_title_field: "Announcement Title",
    news_content_field: "Content / Details",
    news_category_field: "Category",
    publish_news: "Post Announcement",
    news_general: "General",
    news_academic: "Academic",
    news_events: "Events",

    // Provider Application
    apply_title: "Become a Verified Service Provider",
    apply_skills: "Skills / Services Offered",
    apply_portfolio: "Portfolio Links / Bio",
    submit_application: "Submit Application",
    application_submitted: "Your application is submitted and pending admin approval.",
    application_approved: "You are an approved provider! Toggle to Provider view.",
    application_rejected: "Your provider application was rejected.",
    provider_status: "Application Status",

    // Admin Controls
    pending_applications: "Pending Provider Applications",
    applicant: "Applicant",
    skills: "Skills",
    portfolio: "Portfolio / Info",
    action_approve: "Approve",
    action_deny: "Reject",
    no_applications: "No pending provider applications.",
    news_creator: "Publish Campus Announcement"
  },
  am: {
    // Portal / Chooser
    welcome_title: "እንኳን ወደ ዩኒሰርቭ (UniServe) በደህና መጡ",
    welcome_subtitle: "ሁሉንም በአንድ ላይ የያዘ የተማሪዎች አገልግሎትና የማስታወቂያ ማዕከል።",
    choose_language: "Select Language / ቋንቋ ይምረጡ",
    choose_role_title: "ፖርታልዎን ይምረጡ",
    student_portal: "የተማሪዎች ፖርታል",
    admin_portal: "የአስተዳዳሪ ፖርታል",
    student_desc: "አገልግሎቶችን ይመልከቱ፣ ይቅጠሩ፣ አገልግሎት ሰጪ ለመሆን ያመልክቱ ወይም ዜናዎችን ያንብቡ።",
    admin_desc: "የአገልግሎት ሰጪዎችን ማመልከቻ ያጽድቁ እና የካምፓስ ዜናዎችን ያውጡ።",
    student_role_title: "የተማሪ እይታዎን ይምረጡ",
    customer_role: "አገልግሎት መፈለግ እና መቅጠር እፈልጋለሁ",
    customer_desc: "ተማሪዎችን ለክፍያ ትምህርት፣ ለልብስ እጥበት፣ ለዕቃዎች ማድረስ እና ለሌሎች ስራዎች ይቅጠሩ።",
    provider_role: "አገልግሎት ማቅረብ እፈልጋለሁ",
    provider_desc: "የማስታወቂያ አገልግሎት ይፍጠሩ፣ የቅጥር ጥያቄዎችን ያስተዳድሩ እና ገቢ ያግኙ።",
    back_button: "ተመለስ",
    continue: "ቀጥል",

    // Navbar
    nav_home: "ዋና ገጽ",
    nav_services: "አገልግሎቶች",
    nav_news: "ዜና",
    nav_about: "ስለ እኛ",
    nav_dashboard: "ዳሽቦርድ",
    nav_login: "ግባ",
    nav_register: "ተመዝገብ",
    nav_logout: "ውጣ",
    nav_provider_app: "አገልግሎት ሰጪ ለመሆን ማመልከቻ",

    // Hero
    hero_title: "የካምፓስ አገልግሎቶች፣ በቀላሉ።",
    hero_subtitle: "ታማኝ የተማሪ ለአማካይ አገልግሎቶችን ያግኙ ወይም ችሎታዎን አቅርበው በካምፓስ ውስጥ ገቢ ያግኙ።",
    search_placeholder: "አገልግሎቶችን ይፈልጉ (ለምሳሌ፡ የማጠናከሪያ ትምህርት፣ የልብስ እጥበት፣ ማድረስ)...",
    search_button: "ፈልግ",
    filter_all: "ሁሉም ምድቦች",
    category_tutoring: "ማጠናከሪያ ትምህርት እና ቴክኖሎጂ",
    category_laundry: "የልብስ እጥበት እና ማጽዳት",
    category_delivery: "እቃዎች ማድረስ እና መልዕክቶች",
    category_creative: "የፈጠራ ስራ እና ዲዛይን",
    campus_filter_placeholder: "ካምፓስ ይምረጡ...",

    // About Us
    about_title: "ስለ ዩኒሰርቭ",
    about_desc1: "ዩኒሰርቭ በተለይ ለተማሪዎች የተገነባ ከፍተኛ ጥራት ያለው የኢንተርፕራይዝ አገልግሎት ማገናኛ መድረክ ነው። አገልግሎት የሚፈልጉ ተማሪዎችን በካምፓስ ካሉ ባለሙያ ተማሪዎች ጋር እናገናኛለን።",
    about_desc2: "ዓላማችን የተማሪዎችን የስራ ዕድል ማሳደግ፣ የካምፓስ ኑሮን ማቅለል እና ለጥቃቅን አገልግሎቶች እምነት የሚጣልበት አውታረ መረብ መፍጠር ነው። ደህንነት፣ የአጠቃቀም ቀላልነት እና አካባቢያዊ ምቾት ቀዳሚ ምርጫዎቻችን ናቸው።",
    about_feature_trust: "እምነት የሚጣልበት አውታረ መረብ",
    about_feature_trust_desc: "ደህንነቱ የተጠበቀ ክፍያዎች እና በተማሪዎች የተሰጡ ግምገማዎች አስተማማኝ አካባቢ ይፈጥራሉ።",
    about_feature_earn: "በካምፓስ ውስጥ ገቢ ያግኙ",
    about_feature_earn_desc: "ችሎታዎን (ከማስተማር እስከ ልብስ እጥበት) ወደ ተለዋዋጭ እና ጠቃሚ ስራ ይለውጡት።",
    about_feature_news: "የካምፓስ ዜና",
    about_feature_news_desc: "በአስተዳዳሪዎች በቀጥታ የሚለጠፉ ኦፊሴላዊ ማስታወቂያዎችን በመከታተል መረጃ ያግኙ።",

    // Auth
    login_title: "ወደ ዩኒሰርቭ ይግቡ",
    login_btn: "ግባ",
    login_switch: "መለያ የለዎትም? እዚህ ይመዝገቡ",
    register_title: "የተማሪ መለያ ይፍጠሩ",
    register_btn: "ተመዝገብ",
    register_switch: "ቀድሞ መለያ አለዎት? እዚህ ይግቡ",
    field_fullname: "ሙሉ ስም",
    field_email: "የኢሜይል አድራሻ",
    field_password: "የይለፍ ቃል",
    field_role: "የመጀመሪያ ሚና (በነባሪነት ደንበኛ)",

    // Listings
    listings_title: "የሚገኙ የካምፓስ አገልግሎቶች",
    no_listings: "ከእርስዎ ፍላጎት ጋር የሚዛመድ አገልግሎት አልተገኘም።",
    price: "ዋጋ",
    campus: "ካምፓስ",
    provider: "አገልግሎት ሰጪ",
    book_now: "አሁኑኑ ይቅጠሩ",
    create_listing_btn: "አዲስ አገልግሎት መፍጠሪያ",
    listing_title_field: "የአገልግሎቱ ርዕስ",
    listing_desc_field: "የአገልግሎቱ ዝርዝር መግለጫ",
    listing_price_field: "ዋጋ (በብር)",
    listing_category_field: "ምድብ",
    listing_campus_field: "የካምፓስ ቦታ",
    submit_listing: "አገልግሎቱን ይለጥፉ",

    // Bookings / Dashboard
    customer_db_title: "የተማሪ ደንበኛ ዳሽቦርድ",
    provider_db_title: "የአገልግሎት ሰጪ ዳሽቦርድ",
    admin_db_title: "የአስተዳዳሪ ዳሽቦርድ",
    my_bookings: "የእኔ ቅጥሮች",
    booking_id: "የቅጥር መለያ ቁጥር",
    booking_status: "ሁኔታ",
    booking_date: "የተጠየቀበት ቀን",
    booking_actions: "ተግባራት",
    no_bookings: "ምንም የተመዘገበ ቅጥር የለዎትም።",
    status_pending: "በጥበቃ ላይ",
    status_accepted: "ተቀባይነት አግኝቷል",
    status_completed: "ተጠናቋል",
    status_cancelled: "ተሰርዟል",
    status_rejected: "ውድቅ ተደርጓል",
    action_accept: "ተቀበል",
    action_reject: "ውድቅ አድርግ",
    action_complete: "አጠናቅ",
    action_cancel: "ሰርዝ",

    // Reviews
    leave_review: "አስተያየት ይጻፉ",
    rating: "ደረጃ መስጫ (ኮከብ)",
    comment: "አስተያየት / ግብረመልስ",
    submit_review: "አስተያየቱን ይላኩ",
    reviews_title: "የደንበኞች አስተያየት",
    no_reviews: "ለዚህ አገልግሎት ሰጪ እስካሁን የተሰጠ አስተያየት የለም።",

    // News
    latest_news: "የቅርብ ጊዜ የካምፓስ ማስታወቂያዎች",
    no_news: "እስካሁን የወጣ ማስታወቂያ የለም።",
    news_title_field: "የማስታወቂያው ርዕስ",
    news_content_field: "ይዘት / ዝርዝር መረጃ",
    news_category_field: "ምድብ",
    publish_news: "ማስታወቂያውን ይለጥፉ",
    news_general: "አጠቃላይ",
    news_academic: "ትምህርታዊ",
    news_events: "ኩነቶች / ክስተቶች",

    // Provider Application
    apply_title: "የተረጋገጠ አገልግሎት ሰጪ ይሁኑ",
    apply_skills: "ችሎታዎች / የሚያቀርቡት አገልግሎት",
    apply_portfolio: "የስራዎች ማሳያ አገናኞች / መግለጫ",
    submit_application: "ማመልከቻውን አስገባ",
    application_submitted: "ማመልከቻዎ ገብቷል፣ በአስተዳዳሪው መጽደቅን በመጠባበቅ ላይ ነው።",
    application_approved: "እርስዎ የተረጋገጡ አገልግሎት ሰጪ ነዎት! ወደ አገልግሎት ሰጪ እይታ ይቀይሩ።",
    application_rejected: "የአገልግሎት ሰጪነት ማመልከቻዎ ውድቅ ተደርጓል።",
    provider_status: "የማመልከቻው ሁኔታ",

    // Admin Controls
    pending_applications: "የሚጠበቁ የአገልግሎት ሰጪነት ማመልከቻዎች",
    applicant: "አመልካች",
    skills: "ችሎታዎች",
    portfolio: "ማሳያ / መረጃ",
    action_approve: "አጽድቅ",
    action_deny: "ውድቅ አድርግ",
    no_applications: "ምንም የሚጠበቅ ማመልከቻ የለም።",
    news_creator: "የካምፓስ ማስታወቂያ መለጠፊያ"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
