import { Link } from "react-router-dom";
import { UserPlus, Search, Heart, Shield, Clock } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-glow py-20 md:py-32">
        {/* Background Blobs */}
        <div className="warm-glow-blob w-96 h-96 bg-amber-200 top-10 left-10"></div>
        <div className="warm-glow-blob w-80 h-80 bg-teal-200 bottom-10 right-10"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 mb-6">
                Every Child
                <br />
                <span className="text-amber-500">Deserves to be Found</span>
              </h1>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Our AI-powered face recognition system helps reunite missing children with their families. Upload a photo and let technology bring hope.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/search"
                  data-testid="hero-search-button"
                  className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                  <span>Search for Child</span>
                </Link>
                <Link
                  to="/register"
                  data-testid="hero-register-button"
                  className="h-14 px-8 bg-white border-2 border-stone-200 text-stone-700 font-bold rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                  <span>Report Missing</span>
                </Link>
              </div>
            </div>
            
            <div className="animate-slide-up hidden md:block">
              <img
                src="https://images.pexels.com/photos/8033865/pexels-photo-8033865.jpeg"
                alt="Happy children playing"
                className="rounded-3xl shadow-2xl border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="uppercase tracking-widest text-xs font-bold text-stone-500 mb-4 block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-4">
              Simple Steps to Reunite Families
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Our advanced facial recognition technology makes finding missing children faster and more accurate.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm hover:shadow-md transition-shadow card-hover" data-testid="info-card-register">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <UserPlus className="w-8 h-8 text-rose-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Report a Missing Child</h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Parents or guardians can register a missing child by uploading a clear photo and providing essential details like name, age, and last seen location.
              </p>
              <Link
                to="/register"
                data-testid="info-card-register-link"
                className="text-amber-600 font-semibold hover:text-amber-700 flex items-center space-x-1"
              >
                <span>Register Now</span>
                <span>→</span>
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm hover:shadow-md transition-shadow card-hover" data-testid="info-card-search">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Search for a Child</h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Anyone who has seen a child can upload their photo. Our AI instantly compares it against registered missing children and finds potential matches.
              </p>
              <Link
                to="/search"
                data-testid="info-card-search-link"
                className="text-teal-600 font-semibold hover:text-teal-700 flex items-center space-x-1"
              >
                <span>Start Searching</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 md:py-32 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-4">
              Why Choose Our System?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center" data-testid="feature-card-ai">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-amber-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">AI-Powered</h3>
              <p className="text-stone-600">
                Advanced ArcFace model ensures highly accurate facial recognition with minimal false positives.
              </p>
            </div>
            
            <div className="text-center" data-testid="feature-card-fast">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Fast Results</h3>
              <p className="text-stone-600">
                Get instant results when you upload a photo. Every second counts in finding missing children.
              </p>
            </div>
            
            <div className="text-center" data-testid="feature-card-community">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-rose-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Community Driven</h3>
              <p className="text-stone-600">
                Anyone can help. Your photo could be the key to reuniting a family.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            Together, We Can Bring Them Home
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Every photo matters. Every search brings hope.
          </p>
          <Link
            to="/search"
            data-testid="cta-search-button"
            className="inline-flex h-14 px-10 bg-white text-amber-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            Start Searching Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
