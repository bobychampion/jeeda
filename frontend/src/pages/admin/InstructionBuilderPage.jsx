import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { instructionService } from '../../services/instructionService';
import { templatesService } from '../../services/firestoreService';
import { generateInstructionsPDF } from '../../services/pdfService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Save, Download, Bot, X, FileText } from 'lucide-react';

export default function InstructionBuilderPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    materials: [],
    tools: [],
    steps: [],
    tips: [],
    warnings: [],
  });
  const [newMaterial, setNewMaterial] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newWarning, setNewWarning] = useState('');

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchTemplates();
  }, [userData]);

  const fetchTemplates = async () => {
    try {
      const data = await templatesService.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId) => {
    try {
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplate(template);
      
      const existing = await instructionService.getByTemplateId(templateId);
      if (existing) {
        setInstructions(existing);
        setFormData({
          title: existing.title || '',
          materials: existing.materials || [],
          tools: existing.tools || [],
          steps: existing.steps || [],
          tips: existing.tips || [],
          warnings: existing.warnings || [],
        });
      } else {
        setInstructions(null);
        setFormData({
          title: `Assembly Instructions for ${template.name}`,
          materials: [],
          tools: [],
          steps: [],
          tips: [],
          warnings: [],
        });
      }
    } catch (error) {
      alert('Failed to load template.');
    }
  };

  const generateAIDraft = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first.');
      return;
    }
    
    setGenerating(true);
    try {
      const draft = await instructionService.generateAIDraft(selectedTemplate);
      setFormData(draft);
      alert('AI draft generated! Please review and edit as needed.');
    } catch (error) {
      alert('Failed to generate AI draft.');
    } finally {
      setGenerating(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          stepNumber: formData.steps.length + 1,
          title: '',
          description: '',
          imageUrl: '',
        },
      ],
    });
  };

  const updateStep = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const removeStep = (index) => {
    const updatedSteps = formData.steps.filter((_, i) => i !== index);
    updatedSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first.');
      return;
    }
    
    try {
      const instructionData = {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        ...formData,
      };
      
      if (instructions) {
        await instructionService.update(instructions.id, instructionData);
        alert('Instructions updated successfully!');
      } else {
        await instructionService.create(instructionData);
        alert('Instructions created successfully!');
      }
      
      // Link to template
      await templatesService.update(selectedTemplate.id, {
        instructionId: instructions?.id || 'new',
      });
    } catch (error) {
      alert('Failed to save instructions.');
    }
  };

  const handlePreviewPDF = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first.');
      return;
    }
    
    try {
      const orderData = {
        items: [{
          name: selectedTemplate.name,
          templateId: selectedTemplate.id,
        }],
      };
      await generateInstructionsPDF(orderData);
    } catch (error) {
      alert('Failed to generate PDF preview.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-dark flex items-center space-x-2">
              <FileText className="w-8 h-8" />
              <span>Instruction Builder</span>
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={handlePreviewPDF}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
              >
                <Download className="w-5 h-5" />
                <span>Preview PDF</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
              >
                <Save className="w-5 h-5" />
                <span>Save Instructions</span>
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <label className="block text-sm font-medium text-text-dark mb-2">Select Template</label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              <option value="">Choose a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            {selectedTemplate && (
              <button
                onClick={generateAIDraft}
                disabled={generating}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Bot className="w-5 h-5" />
                <span>{generating ? 'Generating...' : 'Generate AI Draft'}</span>
              </button>
            )}
          </div>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-text-dark mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              {/* Materials & Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-text-dark mb-2">Materials</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newMaterial.trim()) {
                            setFormData({
                              ...formData,
                              materials: [...formData.materials, newMaterial.trim()],
                            });
                            setNewMaterial('');
                          }
                        }
                      }}
                      placeholder="Add material"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <button
                      onClick={() => {
                        if (newMaterial.trim()) {
                          setFormData({
                            ...formData,
                            materials: [...formData.materials, newMaterial.trim()],
                          });
                          setNewMaterial('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between bg-background-light p-2 rounded">
                        <span>{material}</span>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              materials: formData.materials.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-text-dark mb-2">Tools</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newTool}
                      onChange={(e) => setNewTool(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTool.trim()) {
                            setFormData({
                              ...formData,
                              tools: [...formData.tools, newTool.trim()],
                            });
                            setNewTool('');
                          }
                        }
                      }}
                      placeholder="Add tool"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <button
                      onClick={() => {
                        if (newTool.trim()) {
                          setFormData({
                            ...formData,
                            tools: [...formData.tools, newTool.trim()],
                          });
                          setNewTool('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.tools.map((tool, index) => (
                      <div key={index} className="flex items-center justify-between bg-background-light p-2 rounded">
                        <span>{tool}</span>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              tools: formData.tools.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-text-dark">Assembly Steps</h2>
                  <button
                    onClick={addStep}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Step</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-text-dark">Step {step.stepNumber}</span>
                        <button
                          onClick={() => removeStep(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        placeholder="Step title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                      <textarea
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        placeholder="Step description"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-text-dark mb-2">Tips</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newTip}
                      onChange={(e) => setNewTip(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTip.trim()) {
                            setFormData({
                              ...formData,
                              tips: [...formData.tips, newTip.trim()],
                            });
                            setNewTip('');
                          }
                        }
                      }}
                      placeholder="Add tip"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <button
                      onClick={() => {
                        if (newTip.trim()) {
                          setFormData({
                            ...formData,
                            tips: [...formData.tips, newTip.trim()],
                          });
                          setNewTip('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.tips.map((tip, index) => (
                      <div key={index} className="flex items-center justify-between bg-background-light p-2 rounded">
                        <span>{tip}</span>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              tips: formData.tips.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-text-dark mb-2">Warnings</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newWarning}
                      onChange={(e) => setNewWarning(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newWarning.trim()) {
                            setFormData({
                              ...formData,
                              warnings: [...formData.warnings, newWarning.trim()],
                            });
                            setNewWarning('');
                          }
                        }
                      }}
                      placeholder="Add warning"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <button
                      onClick={() => {
                        if (newWarning.trim()) {
                          setFormData({
                            ...formData,
                            warnings: [...formData.warnings, newWarning.trim()],
                          });
                          setNewWarning('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.warnings.map((warning, index) => (
                      <div key={index} className="flex items-center justify-between bg-background-light p-2 rounded">
                        <span>{warning}</span>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              warnings: formData.warnings.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

