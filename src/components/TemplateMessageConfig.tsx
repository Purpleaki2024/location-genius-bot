
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { Edit, Trash2, Copy, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define the form schema
const templateSchema = z.object({
  name: z.string().min(2, {
    message: "Template name must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Message content must be at least 10 characters.",
  }),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

// Template type from database
interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TemplateMessageConfig = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch templates from database
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      return data as Template[];
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues & { type: string }) => {
      const variables = extractVariables(values.content);
      
      const { data, error } = await supabase
        .from('message_templates')
        .insert([{
          name: values.name,
          type: values.type,
          content: values.content,
          variables: variables,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast.success("Template created successfully!");
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error("Failed to create template");
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      if (!selectedTemplate) throw new Error('No template selected');
      
      const variables = extractVariables(values.content);

      const { data, error } = await supabase
        .from('message_templates')
        .update({
          name: values.name,
          content: values.content,
          variables: variables,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTemplate.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      toast.success("Template updated successfully!");
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error("Failed to update template");
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      toast.info("Template deleted");
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error("Failed to delete template");
    },
  });

  // Initialize create form
  const createForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  // Initialize edit form
  const editForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  // Handle create form submission
  const onCreateSubmit = (values: TemplateFormValues) => {
    // Generate a type based on the name (you can make this more sophisticated)
    const type = values.name.toLowerCase().replace(/\s+/g, '_');
    createTemplateMutation.mutate({ ...values, type });
  };

  // Handle edit form submission
  const onEditSubmit = (values: TemplateFormValues) => {
    updateTemplateMutation.mutate(values);
  };

  // Extract variables from template content
  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  // Open edit dialog and set form values
  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    editForm.reset({
      name: template.name,
      content: template.content,
    });
    setTemplatePreview(template.content);
    setIsEditDialogOpen(true);
  };

  // Handle template deletion
  const deleteTemplate = (id: string) => {
    deleteTemplateMutation.mutate(id);
  };

  // Handle template usage
  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template copied to clipboard!");
  };

  // Handle template preview
  const previewTemplate = (content: string) => {
    setTemplatePreview(content);
  };

  // Set initial preview to first template
  useEffect(() => {
    if (templates.length > 0 && !templatePreview) {
      setTemplatePreview(templates[0].content);
    }
  }, [templates, templatePreview]);

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Message Templates</h2>
          <p className="text-muted-foreground">
            Create and manage templates for Telegram bot messages
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new message template for your Telegram bot.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short name to identify this template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your message template here. Use {variable_name} for dynamic content." 
                          className="min-h-[120px]" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            previewTemplate(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Use curly braces like {"{variable_name}"} for dynamic content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createTemplateMutation.isPending}>
                    {createTemplateMutation.isPending ? "Creating..." : "Save Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your message template.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short name to identify this template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your message template here. Use {variable_name} for dynamic content." 
                          className="min-h-[120px]" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            previewTemplate(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Use curly braces like {"{variable_name}"} for dynamic content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateTemplateMutation.isPending}>
                    {updateTemplateMutation.isPending ? "Updating..." : "Update Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No templates created yet. The default welcome and location templates have been added to your database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <button
              key={template.id} 
              className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer text-left"
              onClick={() => previewTemplate(template.content)}
              type="button"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">Type: {template.type}</p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyTemplate(template.content);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTemplate(template);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    }}
                    disabled={deleteTemplateMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
              {template.variables && template.variables.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <span 
                        key={variable}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Updated: {new Date(template.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Template Preview</h3>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
          <div className="h-full w-full flex items-center justify-center p-4 overflow-auto">
            {templatePreview ? (
              <div className="text-sm whitespace-pre-wrap font-mono bg-white p-4 rounded border w-full max-w-md">
                {templatePreview}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Select a template to preview its content
              </div>
            )}
          </div>
        </AspectRatio>
      </div>
    </div>
  );
};

export default TemplateMessageConfig;
