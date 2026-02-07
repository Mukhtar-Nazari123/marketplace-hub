import { useLanguage } from '@/lib/i18n';
import PublicLayout from '@/components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Target, Eye, Heart, Award, Users, CheckCircle, History, Star, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAboutSections,
  useAboutValues,
  useAboutTeamMembers,
  useAboutAwards,
} from '@/hooks/useAboutContent';
import { LucideIcon } from 'lucide-react';

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
  Target,
  Eye,
  Heart,
  Award,
  Users,
  CheckCircle,
  History,
  Star,
  Sparkles,
};

const getIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return CheckCircle;
  return iconMap[iconName] || CheckCircle;
};

const About = () => {
  const { t, language, isRTL } = useLanguage();
  
  const { data: sections, isLoading: sectionsLoading } = useAboutSections();
  const { data: values, isLoading: valuesLoading } = useAboutValues();
  const { data: teamMembers, isLoading: teamLoading } = useAboutTeamMembers();
  const { data: awards, isLoading: awardsLoading } = useAboutAwards();

  // Get sections by key
  const visionSection = sections?.find(s => s.section_key === 'vision');
  const missionSection = sections?.find(s => s.section_key === 'mission');
  const historySection = sections?.find(s => s.section_key === 'history');

  const isLoading = sectionsLoading || valuesLoading || teamLoading || awardsLoading;

  return (
    <PublicLayout>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{t.about.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-cyan-400 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.about.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              {missionSection && (
                <div className="bg-card rounded-2xl p-8 shadow-sm border border-border animate-fade-in">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    {(() => {
                      const IconComponent = getIcon(missionSection.icon);
                      return <IconComponent className="text-primary" size={32} />;
                    })()}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {language === 'fa' ? missionSection.title_fa : missionSection.title_en}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === 'fa' ? missionSection.description_fa : missionSection.description_en}
                  </p>
                </div>
              )}

              {/* Vision */}
              {visionSection && (
                <div className="bg-card rounded-2xl p-8 shadow-sm border border-border animate-fade-in">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                    {(() => {
                      const IconComponent = getIcon(visionSection.icon);
                      return <IconComponent className="text-orange-500" size={32} />;
                    })()}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {language === 'fa' ? visionSection.title_fa : visionSection.title_en}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === 'fa' ? visionSection.description_fa : visionSection.description_en}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* History */}
      {historySection && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                {language === 'fa' ? historySection.title_fa : historySection.title_en}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                {language === 'fa' 
                  ? (historySection.content_fa || historySection.description_fa)
                  : (historySection.content_en || historySection.description_en)
                }
              </p>
              {historySection.start_year && (
                <p className="mt-4 text-primary font-semibold">
                  {language === 'fa' ? `از سال ${historySection.start_year}` : `Since ${historySection.start_year}`}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {values && values.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              {t.about.values}
            </h2>
            {valuesLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, idx) => {
                  const IconComponent = getIcon(value.icon);
                  return (
                    <div 
                      key={value.id} 
                      className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center hover:shadow-lg transition-shadow animate-fade-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="text-primary" size={28} />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">
                        {language === 'fa' ? value.title_fa : value.title_en}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fa' ? value.description_fa : value.description_en}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Team */}
      {teamMembers && teamMembers.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              {t.about.team}
            </h2>
            {teamLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member, idx) => (
                  <div 
                    key={member.id} 
                    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={language === 'fa' ? member.name_fa : member.name_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="text-muted-foreground" size={64} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-foreground">
                        {language === 'fa' ? member.name_fa : member.name_en}
                      </h3>
                      <p className="text-primary text-sm mb-2">
                        {language === 'fa' ? member.role_fa : member.role_en}
                      </p>
                      {(member.description_en || member.description_fa) && (
                        <p className="text-sm text-muted-foreground">
                          {language === 'fa' ? member.description_fa : member.description_en}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Awards - Only show if there are awards */}
      {awards && awards.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="text-yellow-500" size={40} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t.about.awards}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {awards.map((award, idx) => (
                <div 
                  key={award.id}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center hover:shadow-lg transition-shadow animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {award.icon_or_image ? (
                    award.icon_or_image.startsWith('http') ? (
                      <img 
                        src={award.icon_or_image} 
                        alt="" 
                        className="w-16 h-16 mx-auto mb-4 object-contain"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {(() => {
                          const IconComponent = getIcon(award.icon_or_image);
                          return <IconComponent className="text-yellow-500" size={28} />;
                        })()}
                      </div>
                    )
                  ) : (
                    <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Star className="text-yellow-500" size={28} />
                    </div>
                  )}
                  <h3 className="font-bold text-foreground mb-2">
                    {language === 'fa' ? award.title_fa : award.title_en}
                  </h3>
                  {award.year && (
                    <p className="text-sm text-primary font-medium mb-2">{award.year}</p>
                  )}
                  {(award.description_en || award.description_fa) && (
                    <p className="text-sm text-muted-foreground">
                      {language === 'fa' ? award.description_fa : award.description_en}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
      </section>
      )}
    </PublicLayout>
  );
};

export default About;
