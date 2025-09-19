# Afro Village Database Export

**Export Date:** September 4, 2025  
**Database:** Afro Village Platform  
**Domain:** afrovillage.sankofa-ngo.org

---

## 📊 Database Overview

This export contains all data from the Afro Village platform database as of the export date.

### Database Statistics
- **Total Tables:** 13
- **Active Users:** 2
- **Active Events:** 0
- **Active Projects:** 0
- **Active Courses:** 0
- **Resource Monitors:** 4

---

## 👥 Users

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| email | varchar | YES | - |
| first_name | varchar | YES | - |
| last_name | varchar | YES | - |
| profile_image_url | varchar | YES | - |
| role | varchar | NO | 'visitor' |
| bio | text | YES | - |
| skills | array | YES | - |
| interests | array | YES | - |
| created_at | timestamp | YES | now() |
| updated_at | timestamp | YES | now() |

**Current Data:**
| ID | Email | First Name | Last Name | Profile Image URL | Role | Bio | Skills | Interests | Created At | Updated At |
|---|---|---|---|---|---|---|---|---|---|---|
| 47019469 | danielduroshola@googlemail.com | Daniel | Duroshola | - | visitor | - | - | - | 2025-09-03 14:29:42 | 2025-09-03 14:29:42 |
| 46631312 | admin@sankofa-ngo.org | - | - | - | visitor | - | - | - | 2025-09-03 15:36:23 | 2025-09-03 15:36:23 |

**Total Users:** 2

---

## 🌿 Village Resources

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| type | varchar | NO | - |
| name | varchar | NO | - |
| current_level | numeric | NO | - |
| capacity | numeric | YES | - |
| unit | varchar | YES | - |
| status | varchar | NO | 'normal' |
| last_updated | timestamp | YES | now() |
| metadata | jsonb | YES | - |

**Current Data:**
| ID | Type | Name | Current Level | Capacity | Unit | Status | Last Updated | Metadata |
|---|---|---|---|---|---|---|---|---|
| d2dfde78-84f0-4860-8c0f-b2a04321baa0 | energy | Energy Independence | 100.00 | 100.00 | percentage | normal | 2025-09-03 14:43:23 | - |
| 1779443f-a223-4d83-9b85-0a0d2f270e5d | water | Water Independence | 100.00 | 100.00 | percentage | normal | 2025-09-03 14:43:23 | - |
| e6546351-c7ef-44f2-a5c5-1a2aa0ab51d0 | food | Food Production | 5.00 | 100.00 | percentage | critical | 2025-09-03 14:43:23 | - |
| cf2bcb3f-c6b6-4c57-8f53-05262a5ce4b6 | connectivity | Connectivity | 99.00 | 100.00 | percentage | normal | 2025-09-03 14:43:23 | - |

**Resource Summary:**
- ✅ **Energy Independence:** 100% (Self-sufficient)
- ✅ **Water Independence:** 100% (Self-sufficient)  
- ⚠️ **Food Production:** 5% (Critical - Early stage)
- ✅ **Connectivity:** 99% (Excellent)

---

## 📅 Events

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| title | varchar | NO | - |
| description | text | YES | - |
| type | varchar | NO | - |
| start_date | timestamp | NO | - |
| end_date | timestamp | NO | - |
| location | varchar | YES | - |
| capacity | integer | YES | - |
| price | numeric | YES | - |
| organizer_id | varchar | NO | - |
| image_url | varchar | YES | - |
| tags | array | YES | - |
| status | varchar | NO | 'active' |
| created_at | timestamp | YES | now() |

**Current Data:** No events currently in database

---

## 📚 Courses

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| title | varchar | NO | - |
| description | text | YES | - |
| category | varchar | NO | - |
| instructor_id | varchar | NO | - |
| duration | integer | YES | - |
| level | varchar | NO | - |
| price | numeric | YES | - |
| image_url | varchar | YES | - |
| syllabus | jsonb | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp | YES | now() |

**Current Data:** No courses currently in database

---

## 💰 Projects & Funding

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| title | varchar | NO | - |
| description | text | YES | - |
| category | varchar | NO | - |
| goal_amount | numeric | NO | - |
| current_amount | numeric | YES | 0 |
| currency | varchar | YES | 'EUR' |
| deadline | date | YES | - |
| status | varchar | NO | 'active' |
| creator_id | varchar | NO | - |
| image_url | varchar | YES | - |
| updates | jsonb | YES | - |
| created_at | timestamp | YES | now() |

**Current Data:** No projects currently in database

---

## 🏠 Accommodations

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| name | varchar | NO | - |
| type | varchar | NO | - |
| description | text | YES | - |
| capacity | integer | NO | - |
| amenities | array | YES | - |
| price_per_night | numeric | NO | - |
| image_url | varchar | YES | - |
| is_available | boolean | YES | true |
| created_at | timestamp | YES | now() |

**Current Data:** No accommodations currently in database

---

## 📝 Bookings

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| accommodation_id | varchar | NO | - |
| user_id | varchar | NO | - |
| check_in | date | NO | - |
| check_out | date | NO | - |
| guests | integer | NO | - |
| total_amount | numeric | NO | - |
| status | varchar | NO | 'pending' |
| special_requests | text | YES | - |
| stripe_payment_intent_id | varchar | YES | - |
| created_at | timestamp | YES | now() |

**Current Data:** No bookings currently in database

---

## 🎨 Artist Profiles

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| user_id | varchar | NO | - |
| artist_name | varchar | YES | - |
| specialty | varchar | YES | - |
| bio | text | YES | - |
| portfolio | jsonb | YES | - |
| rating | numeric | YES | - |
| total_works | integer | YES | 0 |
| is_verified | boolean | YES | false |
| created_at | timestamp | YES | now() |

**Current Data:** No artist profiles currently in database

---

## 💬 Messages

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| sender_id | varchar | NO | - |
| recipient_id | varchar | YES | - |
| content | text | NO | - |
| type | varchar | NO | 'text' |
| is_read | boolean | YES | false |
| thread_id | varchar | YES | - |
| created_at | timestamp | YES | now() |

**Current Data:** No messages currently in database

---

## 💳 Donations

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| project_id | varchar | NO | - |
| user_id | varchar | YES | - |
| amount | numeric | NO | - |
| currency | varchar | YES | 'EUR' |
| message | text | YES | - |
| is_anonymous | boolean | YES | false |
| stripe_payment_intent_id | varchar | YES | - |
| created_at | timestamp | YES | now() |

**Current Data:** No donations currently in database

---

## 📖 Course Enrollments

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| course_id | varchar | NO | - |
| user_id | varchar | NO | - |
| progress | integer | YES | 0 |
| completed_lessons | array | YES | ARRAY[] |
| enrolled_at | timestamp | YES | now() |
| completed_at | timestamp | YES | - |

**Current Data:** No enrollments currently in database

---

## 🎟️ Event Registrations

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | varchar | NO | gen_random_uuid() |
| event_id | varchar | NO | - |
| user_id | varchar | NO | - |
| status | varchar | NO | 'registered' |
| created_at | timestamp | YES | now() |

**Current Data:** No registrations currently in database

---

## 🔐 Sessions

**Table Schema:**
| Column | Type | Nullable | Default |
|---|---|---|---|
| sid | varchar | NO | - |
| sess | jsonb | NO | - |
| expire | timestamp | NO | - |

**Current Data:** Contains active user authentication sessions (sensitive data not displayed)

---

## 🔧 Technical Information

### Database Schema Structure

**Core Tables:**
- `users` - User account management and profiles
- `events` - Event management and scheduling  
- `courses` - Educational content and learning paths
- `projects` - Crowdfunding and project management
- `resources` - Village infrastructure monitoring
- `accommodations` - Lodging and space management
- `bookings` - Reservation system
- `artist_profiles` - Cultural creator portfolios
- `messages` - Community communication
- `donations` - Financial contributions tracking
- `course_enrollments` - Learning progress tracking
- `event_registrations` - Event attendance management
- `sessions` - User authentication sessions

### Integration Status

**Active Integrations:**
- ✅ Replit Authentication (OIDC)
- ✅ PostgreSQL Database (Neon)
- ✅ Stripe Payment Processing (Configured)
- ✅ Victron Energy Monitoring (Live Solar/Battery Data)

### Platform Features

**Implemented:**
- User authentication and profiles
- Resource monitoring dashboard
- Real-time energy monitoring via Victron Energy
- Community member directory
- Project funding framework
- Event and course management framework

**Status:** Platform is operational with core infrastructure in place, ready for content creation and community growth.

---

## 📈 Growth Opportunities

Based on current database state:

1. **Content Creation:** Add events, courses, and projects to showcase village activities
2. **Community Building:** Encourage more user registrations and profile completion
3. **Accommodation Setup:** List available lodging options for visitors and residents
4. **Artist Onboarding:** Invite cultural creators to build profiles and showcase work
5. **Food Production:** Develop food security initiatives to improve the 5% production rate

---

*This export represents the current state of the Afro Village platform database. All personal information is handled according to privacy policies and data protection regulations.*