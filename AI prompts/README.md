# NodePilot AI Prompts - Complete System Documentation

## **Overview**
This folder contains all 13 AI prompts that power NodePilot's sophisticated workflow generation system. These prompts orchestrate a hybrid AI architecture using OpenAI GPT-4o and Claude Sonnet 3.5 to create production-ready n8n workflows.

## **System Architecture**

### **Hybrid AI Flow**
```
User Message → Intent Classification (OpenAI) → 
  ├─ Workflow Request → Prompt Optimization (OpenAI) → Template Matching → Workflow Generation (Claude) → Validation
  └─ General Chat → Conversation Handler (OpenAI) → Response
```

### **Total System Capacity**
- **13 Specialized Prompts**: 32,000+ characters of AI instructions
- **3,905 Node Patterns**: Pre-validated configurations
- **138 Workflow Tips**: Production best practices
- **10 Real Templates**: Complete workflow examples

---

## **Prompt Categories**

### **🎯 Core Generation System (3 prompts)**
1. **main_prompt** - Master workflow generation (Claude)
2. **fast_workflow_generator** - High-speed generation (bypassed)
3. **workflow_prompt_optimizer** - Request enhancement

### **🧠 Intelligence & Classification (2 prompts)**
4. **intent_classification** - Message categorization (OpenAI)
5. **conversation_handler** - General chat responses

### **💬 Communication System (3 prompts)**
6. **chat_prompt** - Core chat instructions
7. **agent_loop** - Continuous operation cycle
8. **modules** - Tool orchestration

### **🧩 Pattern & Template System (3 prompts)**
9. **pattern_generator** - Reusable configurations
10. **template_matcher** - Template selection
11. **workflow_validator** - Quality assurance

### **🧠 Memory Management (2 prompts)**
12. **memory_prompt** - Context preservation
13. **memory_rating_prompt** - Memory importance scoring

---

## **Current System Status**

### **✅ Working Components**
- All 13 prompts loaded and active in database
- Backend hybrid AI system (OpenAI + Claude)
- Intent classification and routing
- Template matching and optimization
- Memory management system

### **⚠️ Known Issues**
- Fast generation API bypassed (uses backend instead)
- Intent classification may miss some workflow requests
- Templates copy functionality needs verification

### **🔄 Current Flow**
1. User message → Frontend
2. Frontend → Backend `/api/chat/message`
3. Backend loads all prompts from database
4. OpenAI classifies intent using `intent_classification`
5. If workflow request:
   - OpenAI optimizes prompt using `workflow_prompt_optimizer`
   - System matches templates using `template_matcher`
   - Claude generates workflow using `main_prompt`
   - System validates using `workflow_validator`
6. If general chat:
   - OpenAI responds using `conversation_handler`

---

## **Prompt Details**

| # | Prompt Name | Characters | Used By | Primary Role |
|---|-------------|------------|---------|--------------|
| 1 | main_prompt | 5,921 | Claude Sonnet 3.5 | Master workflow generation |
| 2 | intent_classification | 1,100 | OpenAI GPT-4o | Message categorization |
| 3 | fast_workflow_generator | 2,229 | Fast API (bypassed) | Speed optimization |
| 4 | workflow_prompt_optimizer | 4,732 | OpenAI GPT-4o | Request enhancement |
| 5 | conversation_handler | 484 | OpenAI GPT-4o | General chat |
| 6 | chat_prompt | 1,346 | General system | Communication rules |
| 7 | agent_loop | 2,133 | Backend system | Operation cycle |
| 8 | memory_prompt | 1,758 | Memory service | Context management |
| 9 | memory_rating_prompt | 2,359 | Memory service | Importance scoring |
| 10 | modules | 1,987 | Tool system | Capability organization |
| 11 | pattern_generator | 1,651 | Pattern system | Configuration creation |
| 12 | template_matcher | 1,792 | Template system | Template selection |
| 13 | workflow_validator | 1,309 | QA system | Quality assurance |

---

## **Performance Metrics**

### **Generation Targets**
- **Simple workflows**: 15-20 seconds
- **Intermediate workflows**: 20-30 seconds  
- **Complex workflows**: 30-45 seconds
- **Maximum time**: 60 seconds

### **Quality Standards**
- **90%+ success rate** on first generation attempt
- **Production-ready** JSON output
- **Comprehensive error handling** included
- **Best practices** automatically applied

---

## **Maintenance Notes**

### **Database Sync**
All prompts are stored in Supabase `ai_prompts` table and loaded dynamically by the backend. Changes to prompts in the database will be reflected in the system immediately.

### **Backup Strategy**
This folder serves as a complete backup of all prompts. If database prompts are corrupted, they can be restored from these markdown files.

### **Version Control**
Each prompt file includes metadata with character counts and status. This helps track changes and ensure consistency across deployments.

---

## **Troubleshooting**

### **If workflows aren't generating:**
1. Check `intent_classification` prompt - may need keyword updates
2. Verify `main_prompt` is loading correctly in backend
3. Test `workflow_prompt_optimizer` for request enhancement

### **If responses are too slow:**
1. Consider re-enabling `fast_workflow_generator`
2. Optimize `template_matcher` for faster selection
3. Review `pattern_generator` for efficiency

### **If quality is poor:**
1. Update `workflow_validator` criteria
2. Enhance `main_prompt` with more examples
3. Improve `pattern_generator` configurations

---

**Last Updated**: June 2025  
**Total System Capacity**: 32,000+ characters across 13 specialized AI prompts  
**Status**: Production Ready with Hybrid AI Architecture
