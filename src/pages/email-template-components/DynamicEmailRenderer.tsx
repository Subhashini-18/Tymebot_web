import { useState, useEffect } from 'react';
import { renderEmailPreviewAsync } from './emailRenderer';
import { companyService } from './companyService';
import { Company } from './index';

interface DynamicEmailRendererProps {
    templateId: string;
    companyId: string;
    props: Record<string, any>;
    onRender?: (html: string) => void;
    children: (html: string, loading: boolean, error: string | null, company: Company | null) => React.ReactNode;
}

export default function DynamicEmailRenderer({
    templateId,
    companyId,
    props,
    onRender,
    children
}: DynamicEmailRendererProps) {
    const [renderedHtml, setRenderedHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        const renderEmail = async () => {
            if (!templateId || !companyId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Get company data (dynamic or static)
                const companyData = await companyService.getCompanyById(companyId);
                if (!companyData) {
                    throw new Error('Company not found');
                }

                setCompany(companyData);

                // Render email with dynamic company data
                const html = await renderEmailPreviewAsync(templateId, companyId, props);
                setRenderedHtml(html);

                if (onRender) {
                    onRender(html);
                }
            } catch (err: any) {
                console.error('Error rendering email:', err);
                setError(err.message || 'Failed to render email');
            } finally {
                setLoading(false);
            }
        };

        renderEmail();
    }, [templateId, companyId, props, onRender]);

    return <>{children(renderedHtml, loading, error, company)}</>;
}