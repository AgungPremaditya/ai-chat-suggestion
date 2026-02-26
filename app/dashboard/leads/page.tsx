import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

const leads = [
  { id: 'L-001', name: 'Michael Scott', company: 'Dunder Mifflin', email: 'michael@dundermifflin.com', status: 'qualified', value: '$12,000', date: '2026-02-22' },
  { id: 'L-002', name: 'Pam Beesly', company: 'Dunder Mifflin', email: 'pam@dundermifflin.com', status: 'new', value: '$8,500', date: '2026-02-21' },
  { id: 'L-003', name: 'Jim Halpert', company: 'Athlead', email: 'jim@athlead.com', status: 'contacted', value: '$22,000', date: '2026-02-20' },
  { id: 'L-004', name: 'Dwight Schrute', company: 'Schrute Farms', email: 'dwight@schrutefarms.com', status: 'lost', value: '$5,000', date: '2026-02-19' },
  { id: 'L-005', name: 'Ryan Howard', company: 'Wuphf', email: 'ryan@wuphf.com', status: 'qualified', value: '$15,000', date: '2026-02-18' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'text-blue-500 bg-blue-500/10' },
  contacted: { label: 'Contacted', className: 'text-amber-500 bg-amber-500/10' },
  qualified: { label: 'Qualified', className: 'text-emerald-500 bg-emerald-500/10' },
  lost: { label: 'Lost', className: 'text-muted bg-secondary' },
};

const stats = [
  { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-accent' },
  { label: 'Qualified', value: leads.filter((l) => l.status === 'qualified').length, icon: UserCheck, color: 'text-emerald-500' },
  { label: 'Contacted', value: leads.filter((l) => l.status === 'contacted').length, icon: Clock, color: 'text-amber-500' },
  { label: 'Lost', value: leads.filter((l) => l.status === 'lost').length, icon: UserX, color: 'text-red-500' },
];

export default function LeadsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
              <p className="text-muted">Track and manage your sales pipeline</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${s.color}`} />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted">{s.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-border bg-background overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => {
                    const status = statusConfig[lead.status];
                    return (
                      <tr key={lead.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-muted">{lead.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted">{lead.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted hidden md:table-cell">{lead.company}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium hidden lg:table-cell">{lead.value}</td>
                        <td className="px-4 py-3 text-sm text-muted hidden lg:table-cell">{lead.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
