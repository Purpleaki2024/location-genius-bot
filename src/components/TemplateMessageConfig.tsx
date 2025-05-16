
import { useState } from "react";
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

// Template type
interface Template {
  id: string;
  name: string;
  content: string;
  lastUsed: string;
}

// Sample templates
const defaultTemplates = [
  {
    id: "1",
    name: "Welcome Message",
    content: "Welcome to our service! We're glad to have you here. How can we assist you today?",
    lastUsed: "2023-12-10",
  },
  {
    id: "2",
    name: "Location Request",
    content: "To provide you with the best service, could you please share your current location?",
    lastUsed: "2023-12-15",
  },
  {
    id: "3",
    name: "Thank You",
    content: "Thank you for using our service. We appreciate your trust and look forward to serving you again!",
    lastUsed: "2023-12-18",
  },
];

const TemplateMessageConfig = () => {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string>("");

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
    // Add new template
    const newTemplate = {
      id: (templates.length + 1).toString(),
      name: values.name,
      content: values.content,
      lastUsed: "Never",
    };
    
    setTemplates([...templates, newTemplate]);
    setIsCreateDialogOpen(false);
    createForm.reset();
    toast.success("Template created successfully!");
  };

  // Handle edit form submission
  const onEditSubmit = (values: TemplateFormValues) => {
    if (!selectedTemplate) return;

    // Update template
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate.id 
        ? { ...template, name: values.name, content: values.content }
        : template
    );
    
    setTemplates(updatedTemplates);
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
    toast.success("Template updated successfully!");
  };

  // Open edit dialog and set form values
  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    editForm.reset({
      name: template.name,
      content: template.content,
    });
    setIsEditDialogOpen(true);
  };

  // Handle template deletion
  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast.info("Template deleted");
  };

  // Handle template usage
  const useTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template copied to clipboard!");
  };

  // Handle template preview
  const previewTemplate = (content: string) => {
    setTemplatePreview(content);
  };

  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Message Templates</h2>
          <p className="text-muted-foreground">
            Create and manage templates for common messages
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new message template for quick responses.
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
                          placeholder="Enter your message template here" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The content of your message template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Save Template</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
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
                          placeholder="Enter your message template here" 
                          className="min-h-[120px]" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            previewTemplate(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The content of your message template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Update Template</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No templates created yet. Create your first template to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
              onClick={() => previewTemplate(template.content)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{template.name}</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      useTemplate(template.content);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTemplate(template);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {template.content}
              </p>
              <p className="text-xs text-muted-foreground">
                Last used: {template.lastUsed}
              </p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Template Preview</h3>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
          <div className="h-full w-full flex items-center justify-center p-4 overflow-auto">
            {templatePreview ? (
              <div className="text-sm whitespace-pre-wrap">{templatePreview}</div>
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
