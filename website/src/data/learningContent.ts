/**
 * Tooth Kingdom Adventure - Learning Content Data
 * 
 * USE THIS FILE TO UPDATE LINKS AND RESOURCES.
 * 
 * This file serves as the central "outlet" for all external content.
 * You can update video URLs, PDF links, and descriptions here without
 * modifying the rest of the application code.
 * 
 * INSTRUCTIONS:
 * 1. Find the resource you want to update in the arrays below.
 * 2. Update the 'url' field with your actual video or PDF link.
 * 3. Update 'thumbnail', 'title', or 'description' as needed.
 */

// ------------------------------------------------------------------
// TYPES (Do not modify these unless you are a developer)
// ------------------------------------------------------------------

export interface Resource {
    id: number;
    title: string;
    description: string;
    type: 'video' | 'pdf' | 'interactive';
    category: 'kids' | 'parents' | 'teachers';
    duration?: string;
    pages?: number;
    rating: number;
    views: string;
    thumbnail: string;
    aiRecommended?: boolean;
    url: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    lessons: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: 'kids' | 'parents' | 'teachers';
    thumbnail: string;
    progress?: number;
    rating: number;
    students: string;
    isDownloaded?: boolean;
    isFeatured?: boolean;
    aiRecommended?: boolean;
    url: string; // <--- UPDATE THIS LINK FOR COURSES
}

export interface PDFResource {
    id: number;
    title: string;
    description: string;
    pages: number;
    size: string;
    rating: number; // Added for UI display
    views: string; // Added for UI display
    category: 'guide' | 'worksheet' | 'reference' | 'activity';
    targetAudience: 'kids' | 'parents' | 'teachers';
    thumbnail: string;
    isDownloaded: boolean;
    downloadProgress?: number;
    aiRecommended?: boolean;
    url: string; // <--- UPDATE THIS LINK FOR PDFS
}

// @ts-ignore - Asset imports are handled by Vite
import thumbnailHero from '../assets/tooth_kingdom_bg.png';
// @ts-ignore
import assetBrushingBasics from '../assets/brushing_basics.png';
// @ts-ignore
import assetSugarMonsters from '../assets/sugar_monsters.png';
// @ts-ignore
import assetColoringBook from '../assets/coloring_book.png';
// @ts-ignore
import assetDentalVisitPrep from '../assets/dental_visit_prep.png';
// @ts-ignore
import assetNutritionGuide from '../assets/nutrition_guide.png';
// @ts-ignore
import assetWorksheets from '../assets/worksheets.png';
// @ts-ignore
import assetEmergencyGuide from '../assets/emergency_guide.png';
// @ts-ignore
import assetRecipeBook from '../assets/recipe_book.png';
// @ts-ignore
import assetSugarBug from '../assets/sugar_bug.png';
// @ts-ignore
import assetMouthBg from '../assets/mouth_bg.png';

// ... (types kept same) ...
// ------------------------------------------------------------------
// DATA - LEARNING RESOURCES (Videos, Interactive, General PDFs)
// ------------------------------------------------------------------

export const LEARNING_RESOURCES: Resource[] = [
    // Kids Resources
    {
        id: 1,
        title: 'Brushing Basics for Heroes',
        description: 'Learn the proper way to brush your teeth with fun animations!',
        type: 'video',
        category: 'kids',
        duration: '5:30',
        rating: 5,
        views: '12.5K',
        thumbnail: '/thumbnails/tooth_kingdom_bg.png',
        url: 'https://www.youtube-nocookie.com/embed/hDZd_06fjkQ' // Colgate: How to Brush
    },
    {
        id: 2,
        title: 'The Sugar Monster Story',
        description: 'An interactive story about how sugar affects your teeth',
        type: 'interactive',
        category: 'kids',
        duration: '10 min',
        rating: 5,
        views: '8.2K',
        thumbnail: '/thumbnails/sugar_monsters.png',
        aiRecommended: true,
        url: 'https://en.wikipedia.org/wiki/Tooth_decay',
    },
    {
        id: 3,
        title: 'Dental Heroes Coloring Book',
        description: 'Print and color your favorite tooth kingdom characters!',
        type: 'pdf',
        category: 'kids',
        pages: 15,
        rating: 4,
        views: '15.3K',
        thumbnail: '/thumbnails/coloring_book.png',
        url: 'https://www.crayola.com/free-coloring-pages/health/dental-coloring-pages/'
    },
    {
        id: 4,
        title: 'Flossing Fun Challenge',
        description: 'Master the art of flossing with step-by-step videos',
        type: 'video',
        category: 'kids',
        duration: '4:15',
        rating: 5,
        views: '9.7K',
        thumbnail: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?ixlib=rb-4.1.0&auto=format&fit=crop&w=1080&q=80',
        url: 'https://www.youtube-nocookie.com/embed/OM6p94tAtGg' // Pinkfong: Brush Your Teeth
    },

    // Parents Resources
    {
        id: 5,
        title: 'Age-Appropriate Oral Care Guide',
        description: 'Complete guide for dental care from infancy to teens',
        type: 'pdf',
        category: 'parents',
        pages: 24,
        rating: 5,
        views: '18.9K',
        thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm93aW5nJTIwdXAlMjBraWRzJTIwaGVhbHRofGVufDF8fHx8MTc2OTE0MDc4OXww&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true,
        url: 'https://www.mouthhealthy.org/life-stages/babies-and-kids'
    },
    {
        id: 6,
        title: 'Creating Healthy Habits',
        description: 'Expert tips on building lasting dental hygiene routines',
        type: 'video',
        category: 'parents',
        duration: '12:45',
        rating: 5,
        views: '14.2K',
        thumbnail: 'https://images.unsplash.com/photo-1516575150278-77136aed6920?ixlib=rb-4.1.0&auto=format&fit=crop&w=1080&q=80',
        url: 'https://www.youtube-nocookie.com/embed/1Wqv-kUX8ao' // Trip to the Dentist (Sesame Street)
    },
    {
        id: 7,
        title: 'Nutrition for Strong Teeth',
        description: 'Foods that promote dental health and what to avoid',
        type: 'pdf',
        category: 'parents',
        pages: 18,
        rating: 4,
        views: '11.5K',
        thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMHBsYXRlfGVufDF8fHx8MTc2OTE0MDc4OXww&ixlib=rb-4.1.0&q=80&w=1080',
        url: 'https://www.healthline.com/nutrition/healthy-teeth-foods'
    },
    {
        id: 8,
        title: 'Dental Visit Preparation',
        description: 'How to prepare your child for their first dentist visit',
        type: 'video',
        category: 'parents',
        duration: '8:20',
        rating: 5,
        views: '16.8K',
        thumbnail: assetDentalVisitPrep,
        aiRecommended: true,
        url: 'https://www.youtube-nocookie.com/embed/h3X6u_2G_pI' // Sesame Street: Healthy Teeth
    },

    // Teachers Resources
    {
        id: 9,
        title: 'Classroom Dental Curriculum',
        description: 'Complete lesson plans for teaching dental hygiene in schools',
        type: 'pdf',
        category: 'teachers',
        pages: 45,
        rating: 5,
        views: '7.3K',
        thumbnail: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc3Jvb20lMjB0ZWFjaGVyfGVufDF8fHx8MTc2OTE0MDc4OXww&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true,
        url: 'https://www.ada.org/resources/community-initiatives/national-childrens-dental-health-month'
    },
    {
        id: 10,
        title: 'Educational Dental Games',
        description: 'Interactive activities and games for group learning',
        type: 'interactive',
        category: 'teachers',
        duration: '30 min',
        rating: 5,
        views: '6.1K',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZ2FtZXN8ZW58MXx8fHwxNzY5MTQwNzg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        url: 'https://pbskids.org/games/teeth/'
    },
    {
        id: 11,
        title: 'Dental Health Assembly Program',
        description: 'Ready-to-use presentation for school assemblies',
        type: 'video',
        category: 'teachers',
        duration: '25:00',
        rating: 4,
        views: '5.8K',
        thumbnail: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.1.0&auto=format&fit=crop&w=1080&q=80',
        url: 'https://www.youtube-nocookie.com/embed/rI1GZlW2B_0' // Healthy Teeth Launch
    },
    {
        id: 12,
        title: 'Printable Worksheets Pack',
        description: 'Fun worksheets and activities for all grade levels',
        type: 'pdf',
        category: 'teachers',
        pages: 32,
        rating: 5,
        views: '9.2K',
        thumbnail: '/thumbnails/worksheets.png',
        url: 'https://www.education.com/worksheets/dental-health/'
    },
];

// ------------------------------------------------------------------
// DATA - LEARNING ACADEMY (Courses & Focused PDFs)
// ------------------------------------------------------------------

export const ACADEMY_COURSES: Course[] = [
    {
        id: 1,
        title: 'Complete Dental Hygiene for Kids',
        description: 'Master brushing, flossing, and healthy habits through fun interactive lessons',
        instructor: 'Dr. Sarah Smile',
        duration: '2h 30m',
        lessons: 12,
        level: 'beginner',
        category: 'kids',
        thumbnail: '/thumbnails/brushing_basics.png',
        progress: 45,
        rating: 5,
        students: '15.2K',
        isDownloaded: true,
        isFeatured: true,
        aiRecommended: true,
        url: 'https://www.youtube-nocookie.com/embed/aOebfGGcjVw', // Complete Dental Hygiene for Kids
    },
    {
        id: 2,
        title: 'Parent\'s Guide: Dental Care 0-12',
        description: 'Complete roadmap for your child\'s dental health from infancy to pre-teens',
        instructor: 'Dr. Mike Tooth',
        duration: '3h 15m',
        lessons: 18,
        level: 'beginner',
        category: 'parents',
        thumbnail: '/thumbnails/dental_visit_prep.png',
        progress: 0,
        rating: 5,
        students: '22.8K',
        isFeatured: true,
        aiRecommended: true,
        url: 'https://www.youtube-nocookie.com/embed/1Wqv-kUX8ao', // Parent's Guide (Full Episode)
    },
    {
        id: 3,
        title: 'Teaching Dental Health in Schools',
        description: 'Professional curriculum for educators with lesson plans and activities',
        instructor: 'Prof. Lisa Care',
        duration: '4h 00m',
        lessons: 24,
        level: 'intermediate',
        category: 'teachers',
        thumbnail: '/thumbnails/worksheets.png',
        rating: 5,
        students: '8.5K',
        aiRecommended: true,
        url: 'https://www.youtube-nocookie.com/embed/YLuaHCbtXW4', // Teaching Dental Health in Schools
    },
    {
        id: 4,
        title: 'Advanced Brushing Techniques',
        description: 'Level up your brushing skills with professional techniques',
        instructor: 'Dr. Emma Clean',
        duration: '1h 45m',
        lessons: 8,
        level: 'advanced',
        category: 'kids',
        thumbnail: '/thumbnails/brushing_basics.png',
        progress: 100,
        rating: 5,
        students: '12.1K',
        url: 'https://www.youtube-nocookie.com/embed/r4v5j2U0fkY', // Advanced Brushing Techniques (Shorts)
    },
    {
        id: 5,
        title: 'Nutrition for Healthy Teeth',
        description: 'Learn which foods strengthen teeth and which to avoid',
        instructor: 'Dr. Carlos Nutri',
        duration: '2h 00m',
        lessons: 10,
        level: 'beginner',
        category: 'parents',
        thumbnail: '/thumbnails/nutrition_guide.png',
        rating: 4,
        students: '18.3K',
        url: 'https://www.youtube-nocookie.com/embed/IUUKyOtSZ8U', // Nutrition for Healthy Teeth
    },
    {
        id: 6,
        title: 'Fun Dental Games & Activities',
        description: 'Interactive games to make dental learning exciting for classrooms',
        instructor: 'Teacher Joy',
        duration: '1h 30m',
        lessons: 6,
        level: 'beginner',
        category: 'teachers',
        thumbnail: '/thumbnails/mouth_bg.png',
        rating: 5,
        students: '6.7K',
        url: 'https://www.youtube-nocookie.com/embed/Hj6a94JiCXk', // Fun Dental Games & Activities
    },
];

export const ACADEMY_PDFS: PDFResource[] = [
    {
        id: 1,
        title: 'Brushing Basics Illustrated Guide',
        description: 'Step-by-step visual guide for proper brushing technique',
        pages: 24,
        size: '4.2 MB',
        rating: 5,
        views: '1.2K',
        category: 'guide',
        targetAudience: 'kids',
        thumbnail: '/thumbnails/brushing_basics.png',
        isDownloaded: true,
        aiRecommended: true,
        url: 'https://www.colgate.com/en-us/oral-health/basics/brushing-and-flossing/how-to-brush'
    },
    {
        id: 2,
        title: 'Dental Heroes Coloring Book',
        description: 'Fun coloring pages featuring all Tooth Kingdom characters',
        pages: 32,
        size: '8.5 MB',
        rating: 5,
        views: '2.5K',
        category: 'activity',
        targetAudience: 'kids',
        thumbnail: '/thumbnails/coloring_book.png',
        isDownloaded: true,
        url: 'https://www.crayola.com/free-coloring-pages/health/dental-coloring-pages/'
    },
    {
        id: 3,
        title: 'Parent\'s Complete Dental Handbook',
        description: 'Comprehensive guide covering all aspects of children\'s dental care',
        pages: 68,
        size: '12.3 MB',
        rating: 5,
        views: '3.8K',
        category: 'reference',
        targetAudience: 'parents',
        thumbnail: '/thumbnails/mouth_bg.png',
        isDownloaded: false,
        aiRecommended: true,
        url: 'https://www.mouthhealthy.org/all-topics-a-z/brushing-companion'
    },
    {
        id: 4,
        title: 'Classroom Worksheets Pack',
        description: '50+ printable worksheets for different grade levels',
        pages: 52,
        size: '15.7 MB',
        rating: 4,
        views: '950',
        category: 'worksheet',
        targetAudience: 'teachers',
        thumbnail: '/thumbnails/worksheets.png',
        isDownloaded: false,
        url: 'https://www.education.com/worksheets/dental-health/'
    },
    {
        id: 5,
        title: 'Tooth Anatomy for Kids',
        description: 'Educational poster and guide explaining tooth structure',
        pages: 8,
        size: '2.1 MB',
        rating: 5,
        views: '5.2K',
        category: 'guide',
        targetAudience: 'kids',
        thumbnail: '/thumbnails/mouth_bg.png',
        isDownloaded: true,
        downloadProgress: 100,
        url: 'https://www.mouthhealthy.org/-/media/project/ada-organization/ada/mouthhealthy/files/kids_brushing_calendar.pdf'
    },
    {
        id: 6,
        title: 'Dental Emergency Response Guide',
        description: 'Quick reference for handling common dental emergencies',
        pages: 16,
        size: '3.4 MB',
        rating: 5,
        views: '2.1K',
        category: 'reference',
        targetAudience: 'parents',
        thumbnail: '/thumbnails/emergency_guide.png',
        isDownloaded: false,
        aiRecommended: true,
        url: 'https://www.mouthhealthy.org/dental-care-concerns/dental-emergencies'
    },
    {
        id: 7,
        title: 'Weekly Dental Activity Planner',
        description: 'Structured activity plans for consistent dental education',
        pages: 28,
        size: '5.8 MB',
        rating: 5,
        views: '1.7K',
        category: 'worksheet',
        targetAudience: 'teachers',
        thumbnail: '/thumbnails/worksheets.png',
        isDownloaded: true,
        url: 'https://www.superteacherworksheets.com/dental-health.html'
    },
    {
        id: 8,
        title: 'Healthy Snacks Recipe Book',
        description: 'Tooth-friendly recipes that kids will love',
        pages: 40,
        size: '9.2 MB',
        rating: 4,
        views: '3.2K',
        category: 'guide',
        targetAudience: 'parents',
        thumbnail: '/thumbnails/recipe_book.png',
        isDownloaded: false,
        url: 'https://www.mouthhealthy.org/en/babies-and-kids/first-dental-visit'
    }
];
